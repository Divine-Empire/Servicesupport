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
import { storage } from "../lib/storage";
import { useToast } from "../hooks/use-toast";
import { Loader2Icon, LoaderIcon, Eye } from "lucide-react";
import { Textarea } from "../components/ui/textarea";

export default function SiteVisit() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingTickets, setPendingTickets] = useState([]);
  const [historyTickets, setHistoryTickets] = useState([]);
  const [showSiteVisitModal, setShowSiteVisitModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchItem, setSearchItem] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  const { toast } = useToast();

  const [masterData, setMasterData] = useState({});

  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sheet_url =
    "https://script.google.com/macros/s/AKfycbzsDuvTz21Qx8fAP3MthQdRanIKnFFScPf-SRYp40CqYfKmO4CImMH7-_cVQjMqCsBD/exec";
  const Sheet_Id = "1teE4IIdCw7qnQvm_W7xAPgmGgpU13dtYw6y5ui01HHc";

  const fetchData = async () => {
    setFetchLoading(true); // start loading
    try {
      const response = await fetch(`${sheet_url}?sheet=Ticket_Enquiry`);
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        // Process the data to match your requirements
        const allData = json.data.slice(6).map((row, index) => ({
          id: index + 1,
          timeStemp: row[0],
          ticketId: row[1], // Column A (assuming this is Ticket id)
          clientName: row[2], // Column C
          phoneNumber: row[3], // Column D
          emailAddress: row[4], // Column E
          category: row[5], // Column F
          priority: row[6], // Column G
          title: row[7], // Column H
          description: row[8], // Column I
          planned1: row[9], // Column J
          actual1: row[10], // Column K

          delay1: row[11], // Delay1
          callType: row[12], // Call type
          requirementServiceCategory: row[13], // Enquiry Type (first one)
          videoCall: row[14], // Enquiry Type (first one)

          sourceOfEnquiry: row[15], // Source of enquiry
          enquiryReceiverName: row[16], // Enquiry Receiver Name
          warrantyCheck: row[17], // Warranty Check
          billNumberInput: row[18], // Bill Number Input

          billAttachmentFile: row[19], // Bill Number Input

          machineName: row[20], // Machine Name
          enquiryType: row[21], // Enquiry Type (second one)
          siteName: row[22], // Site Name
          companyName: row[23], // Company Name
          siteAddress: row[24], // Site Address
          gstAddress: row[25], // GST Address
          state: row[26], // State
          pinCode: row[27], // PIN Code
          engineerAssign: row[28], // Engineer Name
          serviceLocation: row[29], // Service Location
          uploadChallan: row[30],

          planned2: row[31],
          actual2: row[32],
          delay2: row[33],
          videoCallServicesSolve: row[34],
          afterVideoCallGenerateOTP: row[35],
          otpVarificationStatus: row[36],

          planned3: row[37],
          actual3: row[38],
          delay3: row[39],
          quotationNo: row[40],
          basicAmount: row[41],
          totalAmoutWithTex: row[42],
          quotationPdfLink: row[43],
          quotationShareByPersonName: row[44],
          ShareThrough: row[45],
          quotationremarks: row[46],

          planned4: row[47],
          actual4: row[48],
          stage: row[50],
          paymentTerm: row[51],
          acceptanceVia: row[52],
          acceptanceAttachemntFile: row[53],
          paymentMode: row[54],
          seniorApproval: row[55],
          approvalAttachmentFile: row[56],
          whatDidTheCustomerSay: row[57],
          nextAction: row[58],
          nextDateOfCall: row[59],
          followUpRemarks: row[60],

          planned5: row[61],
          actual5: row[62],
          delay5: row[63],
          dateOfVisit: row[64],
          transportation: row[65],

          planned6: row[66],
          actual6: row[67],
          spareDetails: row[69],
          dnCopyFileUpload: row[70],
          dnNumber: row[71],
          serviceAssets: row[72],
          equipmentName: row[73],
          attachment: row[74],
          machineReceiverName: row[75],
          machineReceiverNumber: row[76],
          challanAttachment: row[77],
          invoiceStatus: row[78],

          planned7: row[79],
          actual7: row[80],
          delay7: row[81],
          travelDate: row[82],
          returnDate: row[83],
          destinationInput: row[84],
          purposeOfTravel: row[85],
          amount: row[86],

          planned8: row[87],
          actual8: row[88],
          delay8: row[89],
          nameSiniorBy: row[90],
        }));

        // Filter data based on your conditions

        // console.log("Alldata", allData);

        const pending = allData.filter(
          (item) => item.planned8 !== "" && item.actual8 === ""
        );
        // console.log("pending", pending);

        const history = allData.filter(
          (item) => item.planned8 !== "" && item.actual8 !== ""
        );

        setPendingData(pending);
        setHistoryData(history);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchMasterSheet = async () => {
    try {
      const response = await fetch(`${sheet_url}?sheet=Master`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const headers = result.data[0]; // First row contains headers
        const structuredData = {};

        // Initialize each header with an empty array
        headers.forEach((header) => {
          structuredData[header] = [];
        });

        // Process each data row (skip the header row)
        result.data.slice(1).forEach((row) => {
          row.forEach((value, index) => {
            const header = headers[index];
            // Handle cases where value might be null/undefined or not a string
            if (value !== null && value !== undefined) {
              const stringValue = String(value).trim(); // Convert to string and trim
              if (stringValue !== "") {
                structuredData[header].push(stringValue);
              }
            }
          });
        });

        // Remove duplicates from each array
        Object.keys(structuredData).forEach((key) => {
          structuredData[key] = [...new Set(structuredData[key])];
        });

        // console.log("Structured Master Data:", structuredData);
        setMasterData([structuredData]); // Wrap in array as per your requested format
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
      toast.error("Failed to load master data");
    }
  };

  useEffect(() => {
    fetchMasterSheet();
    fetchData();
  }, []);

  useEffect(() => {
    const tickets = storage.getTickets();
    const pending = tickets.filter((t) => t.status === "tada-completed");
    const history = tickets.filter((t) => t.status === "site-visit-completed");

    setPendingTickets(pending);
    setHistoryTickets(history);
  }, []);

  const handleSiteVisitClick = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      ticketId: ticket.ticketId,
      clientName: ticket.clientName,
      phoneNumber: ticket.phoneNumber,
      enquiryReceiverName: ticket.enquiryReceiverName || "",
      warrantyCheck: ticket.warrantyCheck || "",
      machineName: ticket.machineName || "",
      enquiryType: ticket.enquiryType || "",
      engineerAssign: ticket.engineerAssign || "",
      travelDate: ticket.travelDate || "",
      returnDate: ticket.returnDate || "",
      destination: ticket.destinationInput || "",
      purposeOfTravel: ticket.purposeOfTravel || "",
      amount: ticket.amount || "",
      approval: "",
      approvalName: "",
      lastBalance: "",
      payRightNow: "",
      billFile: "",
      remarks: "",
      approvedAmount: "", // ADD THIS
      approvalRemarks: "", // ADD THIS
    });
    setShowSiteVisitModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderAccountFields = () => {
    if (formData.approval === "BY ACCOUNTS") {
      return (
        <>
          <div>
            <Label>Last Balance</Label>
            <Input
              placeholder="Enter last balance"
              value={formData.lastBalance || ""}
              onChange={(e) => handleInputChange("lastBalance", e.target.value)}
              data-testid="input-last-balance"
            />
          </div>
          <div>
            <Label>Pay Right Now</Label>
            <Input
              placeholder="Enter amount to pay"
              value={formData.payRightNow || ""}
              onChange={(e) => handleInputChange("payRightNow", e.target.value)}
              data-testid="input-pay-now"
            />
          </div>
          <div>
            <Label>Bill No</Label>
            <Input
              type="text"
              onChange={(e) =>
                handleInputChange("billNo", e.target.value || "")
              }
              data-testid="input-bill-NO"
            />
          </div>
          <div>
            <Label>Bill File</Label>
            <Input
              type="file"
              onChange={(e) =>
                handleInputChange("billFile", e.target.files[0] || "")
              }
              data-testid="input-bill-file"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Remarks</Label>
            <Input
              placeholder="Enter remarks"
              value={formData.remarks || ""}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              data-testid="input-remarks"
            />
          </div>
        </>
      );
    }
    return null;
  };

  const uploadImageToDrive = async (file) => {
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
          fileName: `Invoice_${selectedTicket?.ticketId}_${Date.now()}.jpg`,
          base64Data: base64Data,
          mimeType: file.type,
          folderId: "1HfdNf6hCpqGh-3M1RWFaaOrM3HWS1LPX",
        }),
      });

      const result = await uploadResponse.json();
      if (!result.success) {
        console.error("Upload error:", result.error);
        toast({
          title: "Error",
          description: "Failed to upload image to Google Drive",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }

      return result;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return { success: false, error: "Failed to upload image" };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true); // Start loading

    let fileUrl = "";

    if (formData.billFile) {
      const uploadResult = await uploadImageToDrive(formData.billFile);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }
      fileUrl = uploadResult.fileUrl;
    }

    const currentDateTime = formatDateTime(new Date());
    // console.log("currentDateTime", currentDateTime);
    const id = selectedTicket?.id;

    try {
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
          columnData: JSON.stringify({
            CK: currentDateTime,
            CM: formData.certificateUpdatePersonName || "",
            // CI: formData.amount || "",

            DK: formData.approvedAmount || "",
            DL: formData.approvalRemarks || "",
          }),
        }).toString(),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update Google Sheet");
      }

      if (result.success) {
        setPendingData((prevPending) =>
          prevPending.filter(
            (ticket) => ticket.ticketId !== selectedTicket.ticketId
          )
        );
        setHistoryData((prevHistory) => [
          {
            ...selectedTicket,
            actual7: currentDateTime,
            approvalBy: formData.approval,
            nameDropdown: formData.certificateUpdatePersonName,
            lastBalance: formData.lastBalance,
            payRightNow: formData.payRightNow,
            billNo: formData.billNo,
            billFile: fileUrl,
            remarks: formData.remarks,
            amount: formData.amount, // Updated amount will be saved
          },
          ...prevHistory,
        ]);

        toast({
          title: "Success",
          description: "Ticket details saved successfully",
        });

        setShowSiteVisitModal(false);
        // fetchTickets(); // Refresh the ticket list
      } else {
        throw new Error(result.error || "Failed to save ticket details");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to save ticket details",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [cancelSubmit, setCancelSubmit] = useState(false);

  const handleSubmitCancel = async (e) => {
    e.preventDefault();

    setCancelSubmit(true);

    const currentDateTime = formatDateTime(new Date());

    try {
      const rowData = [
        currentDateTime,
        selectedTicket.ticketId || "", // Call Type
        selectedTicket.clientName || "", // Enquiry Receiver Name
        selectedTicket.phoneNumber || "", // Warranty Check
        selectedTicket.emailAddress || "", // Bill Number Input
        selectedTicket.category || "", // Bill Number Input

        selectedTicket.title || "", // Machine Name
        selectedTicket.description || "", // Machine Name
        "Expense Approval By Sinior", // Enquiry Type (second one)
        formData.cancelRemarks || "",
      ];

      // console.log("rowDAta", formData);

      const response = await fetch(sheet_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          sheetName: "Cancel",
          action: "insert",
          rowData: JSON.stringify(rowData),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // setTickets([...tickets, newTicket]);
        setPendingData((prevPending) =>
          prevPending.filter(
            (ticket) => ticket.ticketId !== selectedTicket.ticketId
          )
        );

        toast({
          title: "Success",
          description: "Ticket details Cancle successfully",
        });
        setShowSiteVisitModal(false);
        setIsCancelled(false);
      } else {
        throw new Error(result.error || "Failed to save ticket");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to save ticket. Data stored locally.",
        variant: "destructive",
      });

      // setTickets([...tickets, newTicket]);
    } finally {
      setCancelSubmit(false);
      // setShowForm(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
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

  const filteredPendingData = pendingData
    .filter((item) => {
      const phoneNumberStr = String(item.phoneNumber || "");
      const matchesSearch =
      item.ticketId?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.companyName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase());
      // const matchesParty =
      //   filterParty === "all" || item.partyName === filterParty;
      // return matchesSearch && matchesParty;
      return matchesSearch;
    })
    .reverse();

  const filteredHistoryData = historyData
    .filter((item) => {
      const phoneNumberStr = String(item.phoneNumber || "");
      const matchesSearch =
      item.ticketId?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.companyName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase());
      // const matchesParty =
      //   filterParty === "all" || item.partyName === filterParty;
      // return matchesSearch && matchesParty;
      return matchesSearch;
    })
    .reverse();

  return (
    <div className="space-y-6">
      {/* Filter Options */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full">
              <Label
                htmlFor="searchFilter"
                className="text-sm font-medium text-blue-700"
              >
                Search (Ticket ID, Client, Company, Phone)
              </Label>
              <div className="relative mt-1">
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
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <TabsTrigger
            value="pending"
            data-testid="tab-pending"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Pending ({filteredPendingData.length})
          </TabsTrigger>
          <TabsTrigger
            value="history"
            data-testid="tab-history"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            History ({filteredHistoryData.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Pending Site Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Action
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Ticket ID
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Phone Number
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Enquiry Receiver Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Warranty Check
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Machine Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Enquiry Type
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Engineer Assign
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Travel Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Return Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Destination
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[250px] sticky top-0">
                          Purpose of Travel
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredPendingData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={14}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-pending"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No pending site visits found.
                              </h1>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredPendingData.map((ticket, ind) => (
                          <tr
                            key={ind}
                            className={
                              ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                            }
                          >
                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                onClick={() => handleSiteVisitClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 transition-all duration-300 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md group"
                                data-testid={`button-site-visit-${ticket.ticketId}`}
                              >
                                <Eye className="w-4 h-4 mr-2 transition-all group-hover:scale-110 text-blue-500 group-hover:text-blue-600" />
                                <span className="font-medium">Details</span>
                              </Button>
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {ticket.ticketId}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.phoneNumber}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.enquiryReceiverName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.warrantyCheck}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.machineName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.enquiryType}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.engineerAssign || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.travelDate) || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.returnDate) || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.destinationInput || ""}
                            </td>
                            <td className="px-4 py-3 max-w-xs text-blue-900 truncate hover:whitespace-normal hover:max-w-prose hover:overflow-visible hover:z-20 hover:bg-white hover:shadow-lg hover:border hover:border-blue-200 hover:rounded">
                              {ticket.purposeOfTravel || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.amount || "0"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Site Visit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Ticket ID
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Phone Number
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Machine Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Engineer Assign
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Travel Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Return Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Approval
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Approval Name
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredHistoryData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-history"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No site visit history found.
                              </h1>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredHistoryData.map((ticket, ind) => (
                          <tr
                            key={ind}
                            className={
                              ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                            }
                          >
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {ticket.ticketId}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.phoneNumber}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.machineName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.engineerAssign || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.travelDate) || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.returnDate) || ""}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {ticket.approvalBy || ""}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.nameDropdown || ""}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Site Visit Modal */}
      <Modal
        isOpen={showSiteVisitModal}
        onClose={() => setShowSiteVisitModal(false)}
        title="Expense Approval By Senior"
        size="3xl"
      >
        <div className="bg-white rounded-lg">
          <div className="p-6">
            {/* <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
        Site Visit Details
      </h2> */}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pb-6"
            >
              <div className="flex items-center space-x-2 mb-10">
                <input
                  type="checkbox"
                  id="cancelTicket"
                  checked={isCancelled}
                  onChange={(e) => setIsCancelled(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <Label
                  htmlFor="cancelTicket"
                  className="text-red-600 font-medium"
                >
                  Cancel Ticket
                </Label>
              </div>

              <div></div>

              {/* Pre-filled fields */}
              <div className="space-y-1">
                <Label className="text-gray-600 font-medium">Ticket ID</Label>
                <Input
                  value={formData.ticketId || ""}
                  disabled
                  className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-600 font-medium">Client Name</Label>
                <Input
                  value={formData.clientName || ""}
                  disabled
                  className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-600 font-medium">
                  Phone Number
                </Label>
                <Input
                  value={formData.phoneNumber || ""}
                  disabled
                  className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-600 font-medium">
                  Machine Name
                </Label>
                <Input
                  value={formData.machineName || ""}
                  disabled
                  className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-600 font-medium">
                  Engineer Assign
                </Label>
                <Input
                  value={formData.engineerAssign || ""}
                  disabled
                  className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              {!isCancelled && (
                <>
                  <div className="space-y-1">
                    <Label className="text-gray-600 font-medium">
                      Travel Date
                    </Label>
                    <Input
                      value={formatDate(formData.travelDate) || ""}
                      disabled
                      className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600 font-medium">
                      Return Date
                    </Label>
                    <Input
                      value={formatDate(formData.returnDate) || ""}
                      disabled
                      className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600 font-medium">Amount</Label>
                    <Input
                      value={`₹${formData.amount || "0"}`}
                      // onChange={(e) => {
                      //   // Remove ₹ symbol and update the amount
                      //   const value = e.target.value.replace("₹", "");
                      //   handleInputChange("amount", value);
                      // }}
                      disabled
                      className="bg-white border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-gray-600 font-medium">Name *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("certificateUpdatePersonName", value)
                      }
                    >
                      <SelectTrigger
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        data-testid="select-person-name"
                      >
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        {masterData.length > 0 &&
                        masterData[0]["Expence Approval By Senior"] ? (
                          masterData[0]["Expence Approval By Senior"].map(
                            (item, ind) => (
                              <SelectItem
                                key={ind}
                                value={item || ""}
                                className="hover:bg-blue-50 focus:bg-blue-50"
                              >
                                {item}
                              </SelectItem>
                            )
                          )
                        ) : (
                          <SelectItem value="Loading" disabled>
                            Loading options...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>

                    
                  </div>


                  <div className="space-y-1">
                      <Label className="text-gray-600 font-medium">
                        Approved Amount *
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter approved amount"
                        value={formData.approvedAmount || ""}
                        onChange={(e) =>
                          handleInputChange("approvedAmount", e.target.value)
                        }
                        className="bg-white border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500"
                        data-testid="input-approved-amount"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-gray-600 font-medium">
                        Remarks
                      </Label>
                      <Textarea
                        rows={3}
                        placeholder="Enter remarks"
                        value={formData.approvalRemarks || ""}
                        onChange={(e) =>
                          handleInputChange("approvalRemarks", e.target.value)
                        }
                        className="bg-white border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500"
                        data-testid="textarea-approval-remarks"
                      />
                    </div>

                  {/* Conditional Account fields */}
                  {renderAccountFields()}
                  <div className="md:col-span-2 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSiteVisitModal(false)}
                      data-testid="button-cancel-site-visit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 ease-in-out shadow-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      data-testid="button-submit-site-visit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <Loader2Icon className="animate-spin mr-2" />
                          Processing...
                        </span>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </>
              )}

              {isCancelled && (
                <>
                  <div>
                    <Label>Remarks</Label>
                    <Textarea
                      rows={3}
                      value={formData.cancelRemarks || ""}
                      onChange={(e) =>
                        handleInputChange("cancelRemarks", e.target.value)
                      }
                      data-testid="textarea-remark"
                    />
                  </div>

                  <div className="flex justify-center py-6">
                    <Button
                      type="button"
                      onClick={handleSubmitCancel}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                    >
                      {cancelSubmit && (
                        <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
                      )}
                      Confirm Cancellation
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
