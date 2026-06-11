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
import { Loader2Icon, LoaderIcon, Plus, Trash2 } from "lucide-react";
import { Textarea } from "../components/ui/textarea";

export default function VideoCallSolution() {
  const [activeTab, setActiveTab] = useState("pending");
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({});
  const [masterData, setMasterData] = useState({});
  const [lastOtpGenerations, setLastOtpGenerations] = useState({});

  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  const { toast } = useToast();

  const [isVideoCallSolved, setIsVideoCallSolved] = useState(false);
  const [itemRows, setItemRows] = useState([{ item: "", qty: "" }]);

  const handleAddItemRow = () => {
    if (itemRows.length < 15) {
      setItemRows([...itemRows, { item: "", qty: "" }]);
    }
  };

  const handleItemRowChange = (index, field, value) => {
    const newRows = [...itemRows];
    newRows[index][field] = value;
    setItemRows(newRows);
  };

  const handleDeleteItemRow = (index) => {
    if (itemRows.length > 1) {
      const newRows = itemRows.filter((_, i) => i !== index);
      setItemRows(newRows);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const sheet_url =
    import.meta.env.VITE_APPS_SCRIPT_API;
  const Sheet_Id = import.meta.env.VITE_GOOGLE_SHEET_ID;

  const fetchData = async () => {
    setFetchLoading(true); // start loading
    try {
      const response = await fetch(`${sheet_url}?sheet=Ticket_Enquiry`);
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        // Process the data to match your requirements
        const allData = json.data.slice(6).map((row, index) => ({
          id: index + 1,
          timeStemp: row[0] || "",
          ticketId: row[1] || "", // Column B
          clientName: row[17] || "", // Column R
          phoneNumber: row[18] || "", // Column S
          emailAddress: row[4] || "", // Column E
          category: row[23] || "", // Column X
          priority: row[6] || "", // Column G
          title: row[7] || "", // Column H
          description: row[8] || "", // Column I
          planned1: row[9] || "", // Column J
          actual1: row[10] || "", // Column K

          delay1: row[11] || "", // Delay1
          callType: row[13] || "", // Call type (Col N)
          requirementServiceCategory: row[13] || "", // Enquiry Type (first one)
          videoCall: row[14] || "", // Enquiry Type (first one)

          sourceOfEnquiry: row[12] || "", // Source of enquiry (Col M)
          enquiryReceiverName: row[14] || "", // Enquiry Receiver Name (Col O)
          warrantyCheck: row[17] || "", // Warranty Check (Col R)
          billNumberInput: row[18] || "", // Bill Number Input
          billAttachmentFile: row[19] || "", // Bill Number Input

          clientType: row[15] || "", // Client Type (Col P)
          gstNo: row[21] || "", // GST No. (Col V)
          mentionIssue: row[24] || "", // Mention Issue (Col Y)

          machineName: row[22] || "", // Machine Name (Col W)
          enquiryType: row[21] || "", // Enquiry Type (second one)
          siteName: row[22] || "", // Site Name
          companyName: row[16] || "", // Company Name (Col Q)
          gstAddress: row[19] || "", // GST Address (Col T)
          siteAddress: row[20] || "", // Site Address (Col U)
          state: row[26] || "", // State
          pinCode: row[27] || "", // PIN Code
          engineerAssign: row[130] || "", // Engineer Name (Col EA, fallback to AC)
          serviceType: row[131] || "", // Service Type (Col EB)
          serviceLocation: row[25] || "", // Service Location (Col Z)
          uploadChallan: row[30] || "",

          planned2: row[31] || "", // Col AF
          actual2: row[32] || "", // Col AG
          delay2: row[33] || "",
          videoCallServicesSolve: row[34] || "", // Col AI
          afterVideoCallGenerateOTP: row[35] || "", // Col AJ
          otpVarificationStatus: row[36] || "", // Col AK
          CREName: row[127] || "",
          remarks: row[128] || "", // Col DY
          itemQty: row[129] || "", // Col DZ
        }));

        // Filter data based on your conditions

        const pending = allData.filter(
          (item) => item.planned2 !== "" && item.actual2 === ""
        );
        // console.log("pending", pending);

        const history = allData.filter(
          (item) => item.planned2 !== "" && item.actual2 !== ""
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
      const response = await fetch(`${sheet_url}?sheet=DROPDOWN`);
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
    fetchData();
    fetchMasterSheet();
  }, []);

  const handleSolutionClick = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      videoCallServicesSolve: "",
      otpVerification: "",
      remarks: "",
      cancelRemarks: "",
      engineerAssign: ticket.engineerAssign || "",
      serviceType: ticket.serviceType || "",
    });
    setItemRows([{ item: "", qty: "" }]);
    setIsVideoCallSolved(false);
    setIsCancelled(false);
    setShowSolutionModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true); // Start loading

    if (!formData.videoCallServicesSolve) {
      alert("Please Select Video Call Services");
      setIsSubmitting(false);
      return;
    }

    if (!formData.engineerAssign) {
      alert("Please Select Engineer Name");
      setIsSubmitting(false);
      return;
    }

    if (formData.videoCallServicesSolve === "no" && !formData.serviceType) {
      alert("Please Select Service Type");
      setIsSubmitting(false);
      return;
    }

    if (isVideoCallSolved) {
      if (
        !formData.otpVerification ||
        formData.otpVerification.toString() !==
        selectedTicket.afterVideoCallGenerateOTP.toString()
      ) {
        alert("Wrong OTP, Please Enter Right OTP");
        setIsSubmitting(false);
        return;
      }
    } else if (formData.videoCallServicesSolve === "no") {
      const validRows = itemRows.filter(row => row.item.trim() !== "" && row.qty.toString().trim() !== "");
      if (validRows.length === 0) {
        alert("Please add at least one item and quantity.");
        setIsSubmitting(false);
        return;
      }

      const hasEmptyField = itemRows.some(row => {
        return (row.item.trim() !== "" && !row.qty) || (row.item.trim() === "" && row.qty);
      });
      if (hasEmptyField) {
        alert("Please complete both Item Name and Quantity for all rows.");
        setIsSubmitting(false);
        return;
      }
    }

    const currentDateTime = formatDateTime(new Date());
    const id = selectedTicket?.id;

    const columnData = {
      EA: formData.engineerAssign,
      EB: formData.videoCallServicesSolve === "no" ? (formData.serviceType || "") : "",
      AG: currentDateTime,
      AI: formData.videoCallServicesSolve,
      AK: formData.videoCallServicesSolve === "yes" ? "Verified" : "Skipped",
      DY: formData.remarks || "",
    };

    if (formData.videoCallServicesSolve === "no") {
      columnData.DZ = JSON.stringify(itemRows.filter(row => row.item.trim() !== ""));
    }

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
          columnData: JSON.stringify(columnData),
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
            actual2: currentDateTime,
            videoCallServicesSolve: formData.videoCallServicesSolve,
            otpVarificationStatus: formData.videoCallServicesSolve === "yes" ? "Yes" : "Skipped",
            remarks: formData.remarks || "",
            engineerAssign: formData.engineerAssign,
            serviceType: formData.videoCallServicesSolve === "no" ? formData.serviceType : "",
            itemQty: formData.videoCallServicesSolve === "no"
              ? JSON.stringify(itemRows.filter(row => row.item.trim() !== ""))
              : "",
          },
          ...prevHistory,
        ]);
        toast({
          title: "Success",
          description: "Submitted successfully",
        });
        setShowSolutionModal(false);
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
        "Video Call Solution", // Enquiry Type (second one)
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
        // setFormData({
        //   clientName: "",
        //   phoneNumber: "",
        //   emailAddress: "",
        //   category: "",
        //   priority: "",
        //   title: "",
        //   description: "",
        //   date: new Date().toISOString().split("T")[0],
        // });

        setPendingData((prevPending) =>
          prevPending.filter(
            (ticket) => ticket.ticketId !== selectedTicket.ticketId
          )
        );
        setShowSolutionModal(false);
        setIsCancelled(false);
        toast({
          title: "Success",
          description: "Ticket details Cancle successfully",
        });
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

  function generateSixDigitNumber() {
    let result = "";
    for (let i = 0; i < 6; i++) {
      const digit = Math.floor(Math.random() * 10).toString();
      result += digit.toString();
    }
    return result;
  }

  const [isResending, setIsResending] = useState(false);

  const canGenerateOtp = (ticketId) => {
    if (!lastOtpGenerations[ticketId]) return true;

    const lastGenDate = new Date(lastOtpGenerations[ticketId]);
    const today = new Date();

    return (
      lastGenDate.getDate() !== today.getDate() ||
      lastGenDate.getMonth() !== today.getMonth() ||
      lastGenDate.getFullYear() !== today.getFullYear()
    );
  };

  const ResendOTP = async () => {
    const ticketId = selectedTicket?.ticketId;

    // Check if OTP was already generated today for this specific ticket
    if (!canGenerateOtp(ticketId)) {
      toast({
        title: "Error",
        description: "You can only generate one OTP per day for this ticket",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    const currentDateTime = formatDateTime(new Date());
    const id = selectedTicket?.id;
    const sixDigitNumber1 = generateSixDigitNumber();

    try {
      // Store the current timestamp as last generation time for this ticket
      setLastOtpGenerations((prev) => ({
        ...prev,
        [ticketId]: new Date().toISOString(),
      }));

      // Store in localStorage for persistence across page refreshes
      const storedGenerations = JSON.parse(
        localStorage.getItem("lastOtpGenerations") || "{}"
      );
      storedGenerations[ticketId] = new Date().toISOString();
      localStorage.setItem(
        "lastOtpGenerations",
        JSON.stringify(storedGenerations)
      );

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
            AJ: sixDigitNumber1,
            AK: "Regenerated OTP",
          }),
        }).toString(),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update Google Sheet");
      }

      if (result.success) {
        setSelectedTicket((prev) => ({
          ...prev,
          afterVideoCallGenerateOTP: sixDigitNumber1,
        }));
        toast({
          title: "Success",
          description: "OTP sent successfully",
        });
      } else {
        throw new Error(result.error || "Failed to save ticket details");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Load last OTP generation time from localStorage on component mount
  useEffect(() => {
    const storedGenerations = localStorage.getItem("lastOtpGenerations");
    if (storedGenerations) {
      setLastOtpGenerations(JSON.parse(storedGenerations));
    }
  }, []);

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

  const filteredPendingDataa = pendingData
    .filter((item) => {
      const q = searchItem.toLowerCase();
      const matchesSearch =
        String(item.ticketId || "").toLowerCase().includes(q) ||
        String(item.clientName || "").toLowerCase().includes(q) ||
        String(item.companyName || "").toLowerCase().includes(q) ||
        String(item.phoneNumber || "").toLowerCase().includes(q);
      return matchesSearch;
    })
    .reverse();

  const filteredHistoryDataa = historyData
    .filter((item) => {
      const q = searchItem.toLowerCase();
      const matchesSearch =
        String(item.ticketId || "").toLowerCase().includes(q) ||
        String(item.clientName || "").toLowerCase().includes(q) ||
        String(item.companyName || "").toLowerCase().includes(q) ||
        String(item.phoneNumber || "").toLowerCase().includes(q);
      return matchesSearch;
    })
    .reverse();

  const userName = localStorage.getItem("currentUsername");

  const roleStorage = localStorage.getItem("o2d-auth-storage");
  const parsedData = JSON.parse(roleStorage);
  const role = parsedData.state.user.role;

  const filteredPendingData = role === "user" ? filteredPendingDataa.filter(
    (item) => item["CREName"] === userName
  ) : role === "engineer" ? filteredPendingDataa.filter(
    (item) => item["engineerAssign"] === userName
  ) : filteredPendingDataa;

  const filteredHistoryData = role === "user" ? filteredHistoryDataa.filter(
    (item) => item["CREName"] === userName
  ) : role === "engineer" ? filteredHistoryDataa.filter(
    (item) => item["engineerAssign"] === userName
  ) : filteredHistoryDataa;

  // console.log("filteredPendingData", filteredPendingData);
  // console.log("filteredHistoryData", filteredHistoryData);

  return (
    <div>
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
                {/* Table container with fixed header and scrollable body */}
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="hidden sm:block w-full">
                    {/* Table header - fixed */}
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Action
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Ticket-ID
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Source of enquiry
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Call type
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">
                          Enquiry Receiver Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Client Type
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">
                          Company Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Phone Number
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          GST Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Site Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          GST No.
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Machine Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Category
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Mention Issue
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Service Location
                        </th>
                      </tr>
                    </thead>
                    {/* Table body - scrollable */}
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredPendingData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={17}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-pending"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No pending video call solutions found.
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
                                onClick={() => handleSolutionClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 transition-all duration-300 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md group"
                                data-testid={`button-solution-${ticket.id}`}
                              >
                                <span className="font-medium">Solution</span>
                              </Button>
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.timeStemp)}
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {ticket.ticketId}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.sourceOfEnquiry}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.callType}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.enquiryReceiverName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientType}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.companyName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.phoneNumber}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.gstAddress}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.siteAddress}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.gstNo}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.machineName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.category}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.mentionIssue}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.serviceLocation}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div className="sm:hidden space-y-4">
                    {filteredPendingData.length === 0 ? (
                      <div
                        className="text-center py-8 bg-white"
                        data-testid="text-no-pending"
                      >
                        {fetchLoading ? (
                          <div className="flex justify-center items-center text-blue-700">
                            <LoaderIcon className="animate-spin w-8 h-8" />
                          </div>
                        ) : (
                          <h1 className="text-blue-700">
                            No pending video call solutions found.
                          </h1>
                        )}
                      </div>
                    ) : (
                      filteredPendingData.map((ticket, ind) => (
                        <Card
                          key={ind}
                          className={`${ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                            } border-l-4 border-l-blue-500`}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Header with Ticket ID and Action */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-blue-800 text-lg">
                                  {ticket.ticketId}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {formatDate(ticket.timeStemp)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleSolutionClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 border border-blue-200"
                              >
                                Solution
                              </Button>
                            </div>

                            {/* Client & Company */}
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

                            {/* Contact Details */}
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

                            {/* Call Details */}
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

                            {/* Receiver & GST No */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Receiver Name</p>
                                <p className="text-blue-900">{ticket.enquiryReceiverName || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">GST No.</p>
                                <p className="text-blue-900">{ticket.gstNo || "N/A"}</p>
                              </div>
                            </div>

                            {/* Machine & Category */}
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

                            {/* Issue & Service Location */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Mention Issue</p>
                                <p className="text-blue-900">{ticket.mentionIssue || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Service Location</p>
                                <p className="text-blue-900">{ticket.serviceLocation || "N/A"}</p>
                              </div>
                            </div>

                            {/* Address Info */}
                            <div>
                              <p className="text-gray-500 font-medium text-xs">Site Address</p>
                              <p className="text-blue-900 text-sm">{ticket.siteAddress || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium text-xs">GST Address</p>
                              <p className="text-blue-900 text-sm">{ticket.gstAddress || "N/A"}</p>
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
                {/* Table container with fixed header and scrollable body */}
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="hidden sm:block w-full">
                    {/* Table header - fixed */}
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Ticket-ID
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Source of enquiry
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Call type
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">
                          Enquiry Receiver Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Client Type
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">
                          Company Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Phone Number
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          GST Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Site Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          GST No.
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Machine Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Category
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Mention Issue
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Service Location
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">
                          Video Call Services Solve
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          OTP Verifications
                        </th>
                      </tr>
                    </thead>
                    {/* Table body - scrollable */}
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredHistoryData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={18}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-history"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No video call solution history found.
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
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.timeStemp)}
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {ticket.ticketId}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.sourceOfEnquiry}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.callType}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.enquiryReceiverName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientType}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.companyName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.phoneNumber}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.gstAddress}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.siteAddress}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.gstNo}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.machineName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.category}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.mentionIssue}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.serviceLocation}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.videoCallServicesSolve === "yes"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {ticket.videoCallServicesSolve === "yes"
                                  ? "Yes"
                                  : "No"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  ticket.otpVarificationStatus === "Yes" || ticket.otpVarificationStatus === "Verified"
                                    ? "bg-green-100 text-green-800"
                                    : ticket.otpVarificationStatus === "Skipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {ticket.otpVarificationStatus === "Yes" || ticket.otpVarificationStatus === "Verified"
                                  ? "Verified"
                                  : ticket.otpVarificationStatus === "Skipped"
                                  ? "Skipped"
                                  : "Not Verified"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div className="sm:hidden space-y-4">
                    {filteredHistoryData.length === 0 ? (
                      <div
                        className="text-center py-8 bg-white"
                        data-testid="text-no-history"
                      >
                        {fetchLoading ? (
                          <div className="flex justify-center items-center text-blue-700">
                            <LoaderIcon className="animate-spin w-8 h-8" />
                          </div>
                        ) : (
                          <h1 className="text-blue-700">
                            No video call solution history found.
                          </h1>
                        )}
                      </div>
                    ) : (
                      filteredHistoryData.map((ticket, ind) => (
                        <Card
                          key={ind}
                          className={`${ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                            } border-l-4 border-l-blue-500`}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Header */}
                            <div>
                              <h3 className="font-bold text-blue-800 text-lg">
                                {ticket.ticketId}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {formatDate(ticket.timeStemp)}
                              </p>
                            </div>

                            {/* Client & Company */}
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

                            {/* Contact Details */}
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

                            {/* Call Details */}
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

                            {/* Receiver & GST No */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Receiver Name</p>
                                <p className="text-blue-900">{ticket.enquiryReceiverName || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">GST No.</p>
                                <p className="text-blue-900">{ticket.gstNo || "N/A"}</p>
                              </div>
                            </div>

                            {/* Machine & Category */}
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

                            {/* Issue & Service Location */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Mention Issue</p>
                                <p className="text-blue-900">{ticket.mentionIssue || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Service Location</p>
                                <p className="text-blue-900">{ticket.serviceLocation || "N/A"}</p>
                              </div>
                            </div>

                            {/* Address Info */}
                            <div>
                              <p className="text-gray-500 font-medium text-xs">Site Address</p>
                              <p className="text-blue-900 text-sm">{ticket.siteAddress || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium text-xs">GST Address</p>
                              <p className="text-blue-900 text-sm">{ticket.gstAddress || "N/A"}</p>
                            </div>

                            {/* Solution Status */}
                            <div className="grid grid-cols-2 gap-3 text-sm border-t border-blue-100 pt-2 mt-2">
                              <div>
                                <p className="text-gray-500 font-medium">Video Call Solved</p>
                                <span
                                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ticket.videoCallServicesSolve === "yes"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {ticket.videoCallServicesSolve === "yes"
                                    ? "Yes"
                                    : "No"}
                                </span>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">OTP Status</p>
                                <span
                                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    ticket.otpVarificationStatus === "Yes" || ticket.otpVarificationStatus === "Verified"
                                      ? "bg-green-100 text-green-800"
                                      : ticket.otpVarificationStatus === "Skipped"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {ticket.otpVarificationStatus === "Yes" || ticket.otpVarificationStatus === "Verified"
                                    ? "Verified"
                                    : ticket.otpVarificationStatus === "Skipped"
                                    ? "Skipped"
                                    : "Not Verified"}
                                </span>
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
            </div>
          </CardContent>
        </Card>
      </Tabs>

      {/* Video Call Solution Modal */}
      <Modal
        isOpen={showSolutionModal}
        onClose={() => {
          setShowSolutionModal(false);
          setIsVideoCallSolved(false);
        }}
        title="Video Call Solution"
        size="2xl"
      >
        <div className="bg-white rounded-lg">
          <div className="p-6">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
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
                <Label className="text-gray-600 font-medium">
                  Phone Number
                </Label>
                <Input
                  value={selectedTicket?.phoneNumber || ""}
                  disabled
                  className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-600 font-medium">
                  Machine Name
                </Label>
                <Input
                  value={selectedTicket?.machineName || ""}
                  disabled
                  className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              {!isCancelled && (
                <>
                  <div className="space-y-1">
                    <Label className="text-gray-600 font-medium">
                      Enquiry Receiver Name
                    </Label>
                    <Input
                      value={selectedTicket?.enquiryReceiverName || ""}
                      disabled
                      className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-gray-600 font-medium">
                      Site Name
                    </Label>
                    <Input
                      value={selectedTicket?.siteName || ""}
                      disabled
                      className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-2 px-3 focus:outline-none"
                    />
                  </div>

                  {/* Editable fields */}
                  <div className="space-y-1">
                    <Label className="text-gray-600 font-medium font-sans">
                      Video Call Services Solve *
                    </Label>
                    <Select
                      value={formData.videoCallServicesSolve || ""}
                      onValueChange={(value) => {
                        handleInputChange("videoCallServicesSolve", value);
                        setIsVideoCallSolved(value === "yes");
                      }}
                    >
                      <SelectTrigger
                        data-testid="select-video-solved"
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <SelectValue placeholder="Select option" />
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

                  <div className="space-y-1">
                    <Label className="text-gray-600 font-medium font-sans">
                      Engineer Name *
                    </Label>
                    <Select
                      value={formData.engineerAssign || ""}
                      onValueChange={(value) => {
                        handleInputChange("engineerAssign", value);
                      }}
                    >
                      <SelectTrigger
                        data-testid="select-engineer-assign"
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <SelectValue placeholder="Select Engineer" />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-lg border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                        {(masterData[0]?.["Engineer Assign Name"] || []).map((name, idx) => (
                          <SelectItem key={idx} value={name} className="hover:bg-gray-50">
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.videoCallServicesSolve === "no" && (
                    <div className="space-y-1">
                      <Label className="text-gray-600 font-medium font-sans">
                        Service Type *
                      </Label>
                      <Select
                        value={formData.serviceType || ""}
                        onValueChange={(value) => {
                          handleInputChange("serviceType", value);
                        }}
                      >
                        <SelectTrigger
                          data-testid="select-service-type"
                          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <SelectValue placeholder="Select Service Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white rounded-lg border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                          {(masterData[0]?.["Service Location"] || []).map((name, idx) => (
                            <SelectItem key={idx} value={name} className="hover:bg-gray-50">
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {isVideoCallSolved && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-gray-600 font-medium">
                          OTP Verification *
                        </Label>
                        <Input
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={formData.otpVerification || ""}
                          onChange={(e) =>
                            handleInputChange("otpVerification", e.target.value)
                          }
                          data-testid="input-otp"
                          className="text-center text-lg tracking-widest border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="w-full flex justify-center items-center flex-col mt-2">
                          <div
                            onClick={
                              canGenerateOtp(selectedTicket?.ticketId)
                                ? ResendOTP
                                : null
                            }
                            data-testid="button-resend-otp"
                            className={`px-2 py-1 ${canGenerateOtp(selectedTicket?.ticketId)
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer"
                              : "bg-gray-400 cursor-not-allowed"
                              } text-white rounded-lg transition-all duration-300 shadow-lg text-center w-full flex justify-center items-center`}
                          >
                            {isResending ? (
                              <span className="flex items-center">
                                <LoaderIcon className="animate-spin mr-2" />
                                Resend OTPing...
                              </span>
                            ) : (
                              "Resend OTP"
                            )}
                          </div>

                          {!canGenerateOtp(selectedTicket?.ticketId) && (
                            <p className="text-xs text-gray-500 mt-1">
                              Next OTP available tomorrow
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-gray-600 font-medium">Remarks</Label>
                        <Textarea
                          placeholder="Enter remarks..."
                          value={formData.remarks || ""}
                          onChange={(e) => handleInputChange("remarks", e.target.value)}
                          className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {!isVideoCallSolved && formData.videoCallServicesSolve === "no" && (
                    <div className="space-y-4 md:col-span-2 border-t border-blue-100 pt-4 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-blue-800">Item & Quantity Details *</h4>
                        <Button
                          type="button"
                          onClick={handleAddItemRow}
                          disabled={itemRows.length >= 15}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs shadow transition-all duration-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Row ({itemRows.length}/15)</span>
                        </Button>
                      </div>

                      <div className="border rounded-lg overflow-hidden border-blue-100">
                        <table className="min-w-full divide-y divide-blue-100">
                          <thead className="bg-blue-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700">Item Name *</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 w-24">Qty *</th>
                              <th className="px-4 py-2 text-center text-xs font-semibold text-blue-700 w-16">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-blue-50">
                            {itemRows.map((row, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2">
                                  <Input
                                    placeholder="Enter item name..."
                                    value={row.item}
                                    onChange={(e) => handleItemRowChange(index, "item", e.target.value)}
                                    className="w-full border-gray-200 rounded focus:ring-1 focus:ring-blue-500 text-sm h-8"
                                    required={index === 0}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="Qty"
                                    value={row.qty}
                                    onChange={(e) => handleItemRowChange(index, "qty", e.target.value)}
                                    className="w-full border-gray-200 rounded focus:ring-1 focus:ring-blue-500 text-sm h-8"
                                    required={index === 0}
                                  />
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleDeleteItemRow(index)}
                                    disabled={itemRows.length <= 1}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 h-auto rounded-md disabled:opacity-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-gray-600 font-medium">Remarks</Label>
                        <Textarea
                          placeholder="Enter remarks..."
                          value={formData.remarks || ""}
                          onChange={(e) => handleInputChange("remarks", e.target.value)}
                          className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowSolutionModal(false);
                        setIsVideoCallSolved(false);
                      }}
                      data-testid="button-cancel-solution"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      data-testid="button-submit-solution"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <LoaderIcon className="animate-spin mr-2" />
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
