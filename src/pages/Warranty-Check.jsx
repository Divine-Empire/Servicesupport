import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Modal } from "../components/ui/modal";
import { useToast } from "../hooks/use-toast";
import { LoaderIcon, Eye, FileText } from "lucide-react";

export default function WarrantyCheck() {
  const [activeTab, setActiveTab] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    warrantyCheck: "",
    billNumber: "",
    billAttachment: null,
  });

  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const { toast } = useToast();

  const sheet_url = import.meta.env.VITE_APPS_SCRIPT_API;
  const Sheet_Id = import.meta.env.VITE_GOOGLE_SHEET_ID;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      const response = await fetch(`${sheet_url}?sheet=Ticket_Enquiry`);
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        // Process data (slicing first 6 rows to match pipeline standard)
        const allData = json.data.slice(6).map((row, index) => ({
          id: index + 1,
          timeStemp: row[0] || "",
          ticketId: row[1] || "",
          sourceOfEnquiry: row[12] || "",
          callType: row[13] || "",
          enquiryReceiverName: row[14] || "",
          clientType: row[15] || "",
          companyName: row[16] || "",
          clientName: row[17] || "",
          phoneNumber: row[18] || "",
          gstAddress: row[19] || "",
          siteAddress: row[20] || "",
          gstNo: row[21] || "",
          machineName: row[22] || "",
          category: row[23] || "",
          mentionIssue: row[24] || "",
          serviceLocation: row[25] || "",
          
          // Stage 3 specific columns
          planned3: row[132] || "",       // EC
          actual3: row[133] || "",        // ED
          delay3: row[134] || "",         // EE
          warrantyCheck: row[135] || "",  // EF
          billNumber: row[136] || "",     // EG
          billAttachment: row[137] || "", // EH
          
          CREName: row[127] || "",
          engineerAssign: row[130] || "",
        }));

        const pending = allData.filter(
          (item) => item.planned3 !== "" && item.actual3 === ""
        );
        const history = allData.filter(
          (item) => item.planned3 !== "" && item.actual3 !== ""
        );

        setPendingData(pending);
        setHistoryData(history);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessClick = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      warrantyCheck: "",
      billNumber: "",
      billAttachment: null,
    });
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const uploadFileToDrive = async (file) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result.split(",")[1];
          resolve(result);
        };
        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };
      });

      const uploadResponse = await fetch(`${sheet_url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "uploadFile",
          fileName: `Warranty_${selectedTicket?.ticketId}_${Date.now()}_${file.name}`,
          base64Data: base64Data,
          mimeType: file.type,
          folderId: import.meta.env.VITE_DRIVE_FOLDER_ID,
        }),
      });

      const result = await uploadResponse.json();
      if (!result.success) {
        console.error("Upload error:", result.error);
        toast({
          title: "Upload Error",
          description: "Failed to upload file to Google Drive",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }

      return result;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return { success: false, error: "Failed to upload file" };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.warrantyCheck) {
      toast({
        title: "Validation Error",
        description: "Please select Warranty Check option.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.warrantyCheck === "yes") {
      if (!formData.billNumber) {
        toast({
          title: "Validation Error",
          description: "Please enter the Bill Number.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      if (!formData.billAttachment) {
        toast({
          title: "Validation Error",
          description: "Please attach the Bill file.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    let billAttachmentUrl = "";

    try {
      if (formData.warrantyCheck === "yes" && formData.billAttachment) {
        const uploadResult = await uploadFileToDrive(formData.billAttachment);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Failed to upload bill attachment");
        }
        billAttachmentUrl = uploadResult.fileUrl;
      }

      const currentDateTime = formatDateTime(new Date());
      const id = selectedTicket?.id;

      const columnData = {
        ED: currentDateTime,
        EF: formData.warrantyCheck,
        EG: formData.warrantyCheck === "yes" ? formData.billNumber : "",
        EH: formData.warrantyCheck === "yes" ? billAttachmentUrl : "",
      };

      const response = await fetch(sheet_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          sheetId: Sheet_Id,
          sheetName: "Ticket_Enquiry",
          action: "update",
          rowIndex: (id + 6).toString(),
          columnData: JSON.stringify(columnData),
        }).toString(),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update Google Sheet");
      }

      setPendingData((prevPending) =>
        prevPending.filter((ticket) => ticket.ticketId !== selectedTicket.ticketId)
      );

      setHistoryData((prevHistory) => [
        {
          ...selectedTicket,
          actual3: currentDateTime,
          warrantyCheck: formData.warrantyCheck,
          billNumber: formData.warrantyCheck === "yes" ? formData.billNumber : "",
          billAttachment: formData.warrantyCheck === "yes" ? billAttachmentUrl : "",
        },
        ...prevHistory,
      ]);

      toast({
        title: "Success",
        description: "Warranty check submitted successfully",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save ticket details",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPendingDataa = pendingData
    .filter((item) => {
      const q = searchItem.toLowerCase();
      return (
        String(item.ticketId || "").toLowerCase().includes(q) ||
        String(item.clientName || "").toLowerCase().includes(q) ||
        String(item.companyName || "").toLowerCase().includes(q) ||
        String(item.phoneNumber || "").toLowerCase().includes(q)
      );
    })
    .reverse();

  const filteredHistoryDataa = historyData
    .filter((item) => {
      const q = searchItem.toLowerCase();
      return (
        String(item.ticketId || "").toLowerCase().includes(q) ||
        String(item.clientName || "").toLowerCase().includes(q) ||
        String(item.companyName || "").toLowerCase().includes(q) ||
        String(item.phoneNumber || "").toLowerCase().includes(q)
      );
    })
    .reverse();

  const userName = localStorage.getItem("currentUsername");
  const roleStorage = localStorage.getItem("o2d-auth-storage");
  let role = "admin";
  try {
    if (roleStorage) {
      const parsedData = JSON.parse(roleStorage);
      role = parsedData.state.user.role;
    }
  } catch (e) {
    console.error("Error parsing role storage", e);
  }

  const filteredPendingData =
    role === "user"
      ? filteredPendingDataa.filter((item) => item.CREName === userName)
      : role === "engineer"
      ? filteredPendingDataa.filter((item) => item.engineerAssign === userName)
      : filteredPendingDataa;

  const filteredHistoryData =
    role === "user"
      ? filteredHistoryDataa.filter((item) => item.CREName === userName)
      : role === "engineer"
      ? filteredHistoryDataa.filter((item) => item.engineerAssign === userName)
      : filteredHistoryDataa;

  return (
    <div >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-2">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-blue-100/70">
              
              {/* Left Side: Tabs buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <TabsList className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <TabsTrigger
                    value="pending"
                    data-testid="tab-pending"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Pending ({filteredPendingData?.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    data-testid="tab-history"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    History ({filteredHistoryData?.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Right Side: Search Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 md:justify-end w-full md:w-auto">
                <div className="relative flex-1 max-w-md w-full">
                  <Input
                    id="searchFilter"
                    placeholder="Search by ticket ID, client, company or phone..."
                    className="pl-10 py-2 w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                    data-testid="input-search-filter"
                    onChange={(e) => setSearchItem(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">

              <TabsContent value="pending" className="mt-0">
              <div className="relative overflow-x-auto">
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="hidden sm:table w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Action</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Date</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Ticket-ID</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Source of enquiry</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Call type</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">Enquiry Receiver Name</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Client Type</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">Company Name</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Client Name</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Phone Number</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">GST Address</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">Site Address</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">GST No.</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Machine Name</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Category</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">Mention Issue</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Service Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredPendingData.length === 0 ? (
                        <tr>
                          <td colSpan={17} className="text-center py-8 bg-white text-blue-700">
                            {fetchLoading ? (
                              <div className="flex justify-center items-center">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              "No pending warranty checks found."
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredPendingData.map((ticket, ind) => (
                          <tr key={ind} className={ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"}>
                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                onClick={() => handleProcessClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 transition-all duration-300 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md"
                              >
                                <span className="font-medium">Process</span>
                              </Button>
                            </td>
                            <td className="px-4 py-3 text-blue-900">{formatDate(ticket.timeStemp)}</td>
                            <td className="px-4 py-3 font-medium text-blue-800">{ticket.ticketId}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.sourceOfEnquiry}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.callType}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.enquiryReceiverName}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.clientType}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.companyName}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.clientName}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.phoneNumber}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.gstAddress}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.siteAddress}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.gstNo}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.machineName}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.category}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.mentionIssue}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.serviceLocation}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-4">
                    {filteredPendingData.length === 0 ? (
                      <div className="text-center py-8 bg-white text-blue-700">
                        {fetchLoading ? (
                          <div className="flex justify-center items-center">
                            <LoaderIcon className="animate-spin w-8 h-8" />
                          </div>
                        ) : (
                          "No pending warranty checks found."
                        )}
                      </div>
                    ) : (
                      filteredPendingData.map((ticket, ind) => (
                        <Card key={ind} className={`${ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"} border-l-4 border-l-blue-500`}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-blue-800 text-lg">{ticket.ticketId}</h3>
                                <p className="text-sm text-gray-500">{formatDate(ticket.timeStemp)}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleProcessClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 border border-blue-200"
                              >
                                Process
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Client Name</p>
                                <p className="text-blue-900">{ticket.clientName || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Company Name</p>
                                <p className="text-blue-900">{ticket.companyName || "N/A"}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Phone Number</p>
                                <p className="text-blue-900">{ticket.phoneNumber || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Client Type</p>
                                <p className="text-blue-900">{ticket.clientType || "N/A"}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Call Type</p>
                                <p className="text-blue-900">{ticket.callType || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Source of Enquiry</p>
                                <p className="text-blue-900">{ticket.sourceOfEnquiry || "N/A"}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Machine Name</p>
                                <p className="text-blue-900">{ticket.machineName || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Category</p>
                                <p className="text-blue-900">{ticket.category || "N/A"}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
        </TabsContent>

              <TabsContent value="history" className="mt-0">
              <div className="relative overflow-x-auto">
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="hidden sm:table w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Date</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Ticket-ID</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Source of enquiry</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Call type</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">Enquiry Receiver Name</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Client Type</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">Company Name</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Client Name</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Phone Number</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">GST Address</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">Site Address</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">GST No.</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Machine Name</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Category</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">Mention Issue</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Service Location</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Warranty Check</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Bill Number</th>
                        <th className="border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Bill Copy</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredHistoryData.length === 0 ? (
                        <tr>
                          <td colSpan={19} className="text-center py-8 bg-white text-blue-700">
                            {fetchLoading ? (
                              <div className="flex justify-center items-center">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              "No history found."
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredHistoryData.map((ticket, ind) => (
                          <tr key={ind} className={ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"}>
                            <td className="px-4 py-3 text-blue-900">{formatDate(ticket.timeStemp)}</td>
                            <td className="px-4 py-3 font-medium text-blue-800">{ticket.ticketId}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.sourceOfEnquiry}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.callType}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.enquiryReceiverName}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.clientType}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.companyName}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.clientName}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.phoneNumber}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.gstAddress}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.siteAddress}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.gstNo}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.machineName}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.category}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.mentionIssue}</td>
                            <td className="px-4 py-3 text-blue-900">{ticket.serviceLocation}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  ticket.warrantyCheck === "yes"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {ticket.warrantyCheck === "yes" ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-blue-900">{ticket.billNumber || "N/A"}</td>
                            <td className="px-4 py-3">
                              {ticket.billAttachment ? (
                                <a
                                  href={ticket.billAttachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline gap-1 text-sm font-medium"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Bill
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-4">
                    {filteredHistoryData.length === 0 ? (
                      <div className="text-center py-8 bg-white text-blue-700">
                        {fetchLoading ? (
                          <div className="flex justify-center items-center">
                            <LoaderIcon className="animate-spin w-8 h-8" />
                          </div>
                        ) : (
                          "No history found."
                        )}
                      </div>
                    ) : (
                      filteredHistoryData.map((ticket, ind) => (
                        <Card key={ind} className={`${ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"} border-l-4 border-l-blue-500`}>
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h3 className="font-bold text-blue-800 text-lg">{ticket.ticketId}</h3>
                              <p className="text-sm text-gray-500">{formatDate(ticket.timeStemp)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Client Name</p>
                                <p className="text-blue-900">{ticket.clientName || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Company Name</p>
                                <p className="text-blue-900">{ticket.companyName || "N/A"}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Warranty Check</p>
                                <span
                                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    ticket.warrantyCheck === "yes"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {ticket.warrantyCheck === "yes" ? "Yes" : "No"}
                                </span>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Bill Number</p>
                                <p className="text-blue-900">{ticket.billNumber || "N/A"}</p>
                              </div>
                            </div>

                            {ticket.billAttachment && (
                              <div className="pt-2 border-t border-blue-100">
                                <a
                                  href={ticket.billAttachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800 gap-1 text-sm font-medium"
                                >
                                  <FileText className="w-4 h-4" />
                                  View Bill Copy
                                </a>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
        </TabsContent>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      {/* Warranty Check Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          if (!isSubmitting) setShowModal(false);
        }}
        title="Warranty Check"
        size="lg"
      >
        <div className="bg-white rounded-lg">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pre-filled info for context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-600 font-medium">Ticket ID</Label>
                  <Input
                    value={selectedTicket?.ticketId || ""}
                    disabled
                    className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-600 font-medium">Client Name</Label>
                  <Input
                    value={selectedTicket?.clientName || ""}
                    disabled
                    className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-600 font-medium">Phone Number</Label>
                  <Input
                    value={selectedTicket?.phoneNumber || ""}
                    disabled
                    className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-600 font-medium">Machine Name</Label>
                  <Input
                    value={selectedTicket?.machineName || ""}
                    disabled
                    className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <Label className="text-gray-600 font-medium">
                    Warranty Check *
                  </Label>
                  <Select
                    value={formData.warrantyCheck}
                    onValueChange={(value) => handleInputChange("warrantyCheck", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select Yes/No" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-lg border-gray-200 shadow-lg">
                      <SelectItem value="yes" className="hover:bg-gray-50">
                        Yes
                      </SelectItem>
                      <SelectItem value="no" className="hover:bg-gray-50">
                        No
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.warrantyCheck === "yes" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-gray-600 font-medium">
                        Bill Number Input *
                      </Label>
                      <Input
                        placeholder="Enter bill number"
                        value={formData.billNumber}
                        onChange={(e) => handleInputChange("billNumber", e.target.value)}
                        disabled={isSubmitting}
                        required
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-gray-600 font-medium">
                        Bill Attachment *
                      </Label>
                      <Input
                        type="file"
                        onChange={(e) => handleInputChange("billAttachment", e.target.files[0] || null)}
                        disabled={isSubmitting}
                        required
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <LoaderIcon className="animate-spin mr-2 w-4 h-4" />
                      Uploading & Submitting...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
