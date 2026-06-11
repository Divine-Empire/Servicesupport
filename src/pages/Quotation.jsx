import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Modal } from "../components/ui/modal";
import { useToast } from "../hooks/use-toast";
import { Loader2Icon, LoaderIcon } from "lucide-react";
import MakeQuotation from "./Quotation/MakeQuotation";

export default function Quotation() {
  const [activeTab, setActiveTab] = useState("pending");
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [masterData, setMasterData] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({});

  const [quotationData, setQuotationData] = useState([]);
  const [ticketsMap, setTicketsMap] = useState({});

  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingQuotation, setIsUploadingQuotation] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [filterTotalQuotation, setFilterTotalQuotation] = useState("all");
  const [isCancelled, setIsCancelled] = useState(false);
  const [showMakeQuotationModal, setShowMakeQuotationModal] = useState(false);
  const { toast } = useToast();

  const sheet_url =
    import.meta.env.VITE_APPS_SCRIPT_API;

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      const response = await fetch(`${sheet_url}?sheet=Ticket_Enquiry`);
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
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

          // Stage specific
          emailAddress: row[4] || "",
          title: row[7] || "",
          description: row[8] || "",
          otpVarificationStatus: row[36] || "",

          planned3: row[37] || "",
          actual3: row[38] || "",
          totalQutation: row[125] || row[99] || row[100] || "",
          CREName: row[127] || "",
          engineerAssign: row[130] || row[28] || "",
        }));

        // Store standard lookup map for history enrichment
        const ticketsMapObj = {};
        allData.forEach((ticket) => {
          if (ticket.ticketId) {
            ticketsMapObj[ticket.ticketId] = ticket;
          }
        });
        setTicketsMap(ticketsMapObj);

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

  const fetchMasterSheet = async () => {
    try {
      const response = await fetch(`${sheet_url}?sheet=Master`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const headers = result.data[0];
        const structuredData = {};

        headers.forEach((header) => {
          structuredData[header] = [];
        });

        result.data.slice(1).forEach((row) => {
          row.forEach((value, index) => {
            const header = headers[index];
            if (value !== null && value !== undefined) {
              const stringValue = String(value).trim();
              if (stringValue !== "") {
                structuredData[header].push(stringValue);
              }
            }
          });
        });

        Object.keys(structuredData).forEach((key) => {
          structuredData[key] = [...new Set(structuredData[key])];
        });

        setMasterData([structuredData]);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
      toast({
        title: "Error",
        description: "Failed to load master data",
        variant: "destructive",
      });
    }
  };

  const fetchQuotationSheet = async () => {
    try {
      const response = await fetch(`${sheet_url}?sheet=Quotation`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const headers = result.data[0];
        const formattedData = result.data.slice(1).map((row) => {
          const obj = {};
          headers.forEach((header, index) => {
            const key = header.toLowerCase().replace(/\s+/g, "_");
            obj[key] = row[index] || null;
          });
          return obj;
        });

        setQuotationData(formattedData);
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
      toast({
        title: "Error",
        description: "Failed to load master data",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMasterSheet();
    fetchQuotationSheet();
    fetchData();
  }, []);

  // Get unique Total Quotation values for pending section only
  const uniquePendingTotalQuotations = [
    ...new Set(
      pendingData
        .map((item) => {
          const val = item.totalQutation;
          // Convert to string and trim to handle various formats
          if (val === null || val === undefined) return null;
          const strVal = String(val).trim();
          // Return the value even if it's empty or "0"
          return strVal !== "" ? strVal : "0";
        })
        .filter((val) => val !== null)
    ),
  ].sort((a, b) => {
    // Sort numerically if both are numbers, otherwise alphabetically
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });

  const filteredPendingDataa = pendingData
    .filter((item) => {
      const q = searchItem.toLowerCase();
      const matchesSearch =
        String(item.ticketId || "").toLowerCase().includes(q) ||
        String(item.clientName || "").toLowerCase().includes(q) ||
        String(item.companyName || "").toLowerCase().includes(q) ||
        String(item.phoneNumber || "").toLowerCase().includes(q);

      // Handle totalQutation comparison - convert to string and trim
      // Include items where totalQutation is 0, "0", empty string, or any other value
      let itemTotalQuotation =
        item.totalQutation !== null && item.totalQutation !== undefined
          ? String(item.totalQutation).trim()
          : "";

      // Convert empty string to "0" for comparison
      if (itemTotalQuotation === "") {
        itemTotalQuotation = "0";
      }

      const filterValue = String(filterTotalQuotation || "").trim();
      const matchesTotalQuotation =
        filterTotalQuotation === "all" || itemTotalQuotation === filterValue;

      return matchesSearch && matchesTotalQuotation;
    })
    .reverse();

  const enrichedQuotationData = quotationData.map((item) => {
    const ticketDetails = ticketsMap[item.ticket_id] || {};
    return {
      ...item,
      // 16 core pipeline properties
      timeStemp: ticketDetails.timeStemp || item.timestamp || "",
      ticketId: item.ticket_id || "",
      sourceOfEnquiry: ticketDetails.sourceOfEnquiry || "",
      callType: ticketDetails.callType || "",
      enquiryReceiverName: ticketDetails.enquiryReceiverName || "",
      clientType: ticketDetails.clientType || "",
      companyName: ticketDetails.companyName || item.company_name || "",
      clientName: ticketDetails.clientName || item.client_name || "",
      phoneNumber: ticketDetails.phoneNumber || item.phone_number || "",
      gstAddress: ticketDetails.gstAddress || "",
      siteAddress: ticketDetails.siteAddress || "",
      gstNo: ticketDetails.gstNo || "",
      machineName: ticketDetails.machineName || "",
      category: ticketDetails.category || "",
      mentionIssue: ticketDetails.mentionIssue || "",
      serviceLocation: ticketDetails.serviceLocation || "",

      // Roles lookup fallback
      CREName: ticketDetails.CREName || "",
      engineerAssign: ticketDetails.engineerAssign || "",
    };
  });

  const filteredHistoryDataa = enrichedQuotationData.filter((item) => {
    const q = searchItem.toLowerCase();
    const matchesSearch =
      String(item.ticketId || "").toLowerCase().includes(q) ||
      String(item.clientName || "").toLowerCase().includes(q) ||
      String(item.companyName || "").toLowerCase().includes(q) ||
      String(item.phoneNumber || "").toLowerCase().includes(q) ||
      String(item["quotation_no."] || item.quotation_no || "").toLowerCase().includes(q);

    return matchesSearch;
  });



  const handleQuotationClick = (ticket) => {
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
      siteAddress: ticket.siteAddress || "",
      videoCallServicesSolve: ticket.videoCallServicesSolve || "",
      otpVerifications: ticket.otpVerification || "",
      quotationNo: "",
      basicAmount: "",
      totalAmountWithTax: "",
      quotationPdfLink: "",
      quotationShareBy: "",
      shareThrough: "",
      remarks: "",
    });
    setShowQuotationModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          folderId: import.meta.env.VITE_DRIVE_FOLDER_ID,
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

  const handleQuotationChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingQuotation(true);
    try {
      const result = await uploadImageToDrive(file);
      if (result.success && result.fileUrl) {
        handleInputChange("quotationPdfUrl", result.fileUrl);
        handleInputChange("quotationPdfLink", result.fileUrl);
        toast({
          title: "Success",
          description: "Quotation details uploaded successfully",
        });
      } else {
        e.target.value = null;
        handleInputChange("quotationPdfUrl", "");
        handleInputChange("quotationPdfLink", "");
      }
    } catch (error) {
      console.error(error);
      e.target.value = null;
      handleInputChange("quotationPdfUrl", "");
      handleInputChange("quotationPdfLink", "");
    } finally {
      setIsUploadingQuotation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.quotationPdfLink) {
      alert("Please Upload quotation PDF");
      return;
    }

    if (!formData.quotationShare) {
      alert("Please select quotation Share");
      return;
    }

    if (!formData.quotationShareBy) {
      alert("Please select quotation Shareby");
      return;
    }

    setIsSubmitting(true);
    let fileUrl = formData.quotationPdfUrl || formData.quotationPdfLink || "";

    const currentDateTime = formatDateTime(new Date());

    try {
      const rowData = [
        currentDateTime,
        formData.ticketId || "",
        formData.clientName || "",
        formData.phoneNumber || "",
        formData.quotationNo || "",
        formData.basicAmount || "",
        formData.totalAmountWithTax,
        fileUrl || "",
        formData.quotationShareBy || "",
        "Mail",
        formData.quotationShare || "",
        formData.remarks || "",
      ];

      const response = await fetch(sheet_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          sheetName: "Quotation",
          action: "insert",
          rowData: JSON.stringify(rowData),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPendingData((prevPending) =>
          prevPending.filter(
            (ticket) => ticket.ticketId !== selectedTicket.ticketId
          )
        );
        setHistoryData((prevHistory) => [
          {
            ...selectedTicket,
            actual3: currentDateTime,
            quotationNo: formData.quotationNo,
            basicAmount: formData.basicAmount,
            totalAmountWithTax: formData.totalAmountWithTax,
            quotationPdfLink: fileUrl,
            quotationShareBy: formData.quotationShareBy,
            shareThrough: formData.shareThrough,
            remarks: formData.remarks,
          },
          ...prevHistory,
        ]);

        toast({
          title: "Success",
          description: "Ticket details saved successfully",
        });
        setShowQuotationModal(false);
      } else {
        throw new Error(result.error || "Failed to save ticket details");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to save ticket. Data stored locally.",
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
        selectedTicket.ticketId || "",
        selectedTicket.clientName || "",
        selectedTicket.phoneNumber || "",
        selectedTicket.emailAddress || "",
        selectedTicket.category || "",
        selectedTicket.title || "",
        selectedTicket.description || "",
        "Quotation",
        formData.cancelRemarks || "",
      ];

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
        setPendingData((prevPending) =>
          prevPending.filter(
            (ticket) => ticket.ticketId !== selectedTicket.ticketId
          )
        );
        setShowQuotationModal(false);
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
    } finally {
      setCancelSubmit(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const userName = localStorage.getItem("currentUsername");

  const roleStorage = localStorage.getItem("o2d-auth-storage");
  const parsedData = JSON.parse(roleStorage);
  const role = parsedData.state.user.role;

  const filteredPendingData = role === "user" ? filteredPendingDataa.filter(
    (item) => item["CREName"] === userName
  ) : filteredPendingDataa;

  const filteredHistoryData = role === "user" ? filteredHistoryDataa.filter(
    (item) => item["CREName"] === userName
  ) : filteredHistoryDataa;

  // console.log("filteredPendingData", filteredPendingData);
  // console.log("filteredHistoryData", filteredHistoryData);

  return (
    <div >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-2">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-blue-100/70">
              
              {/* Left Side: Tabs buttons and Make Quotation Button */}
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

              {/* Right Side: Search and Dropdown Filter */}
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

                {activeTab === "pending" && (
                  <div className="w-full sm:w-48">
                    <select
                      id="totalQuotationFilter"
                      value={filterTotalQuotation}
                      onChange={(e) => setFilterTotalQuotation(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      data-testid="select-total-quotation-filter"
                    >
                      <option value="all">All Quotation Revice</option>
                      {uniquePendingTotalQuotations.map((quotation) => (
                        <option key={quotation} value={quotation}>
                          {quotation}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                                <Button
                  size="sm"
                  variant="outline"
                  className="bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 border-green-200 hover:from-green-100 hover:to-emerald-100 shadow-sm"
                  onClick={() => {
                    setSelectedTicket(null);
                    setShowMakeQuotationModal(true);
                  }}
                >
                  <span className="font-medium">Make Quotation</span>
                </Button>
              </div>
            </div>

            <div className="mt-6">

              <TabsContent value="pending" className="mt-0">
              <div className="relative overflow-x-auto">
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="hidden sm:block w-full">
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
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Type
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
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
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          OTP Status
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation Revice
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation PDF
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {fetchLoading ? (
                        <tr>
                          <td
                            colSpan={20}
                            className="text-center py-8 bg-white"
                          >
                            <div className="flex justify-center items-center text-blue-700">
                              <LoaderIcon className="animate-spin w-8 h-8 mr-2" />
                            </div>
                          </td>
                        </tr>
                      ) : filteredPendingData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={20}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-pending"
                          >
                            <h1 className="text-blue-700">
                              No pending quotations found.
                            </h1>
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
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 transition-all duration-300 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md group"
                                onClick={() => handleQuotationClick(ticket)}
                                data-testid={`button-quotation-${ticket.id}`}
                              >
                                <span className="font-medium">Quotation</span>
                              </Button>
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {formatDate(ticket.timeStemp)}
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {ticket.ticketId}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.sourceOfEnquiry || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.callType || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.enquiryReceiverName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientType || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.companyName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.phoneNumber || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.gstAddress || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.siteAddress || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.gstNo || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.machineName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.category || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.mentionIssue || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.serviceLocation || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.otpVarificationStatus || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.totalQutation !== null &&
                              ticket.totalQutation !== undefined
                                ? String(ticket.totalQutation).trim() || "0"
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.quotationPdfLink ? (
                                <a
                                  href={ticket.quotationPdfLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  View PDF
                                </a>
                              ) : (
                                ""
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-4">
                    {fetchLoading ? (
                      <div className="text-center py-8 bg-white">
                        <div className="flex justify-center items-center text-blue-700">
                          <LoaderIcon className="animate-spin w-8 h-8 mr-2" />
                        </div>
                      </div>
                    ) : filteredPendingData.length === 0 ? (
                      <div
                        className="text-center py-8 bg-white"
                        data-testid="text-no-pending"
                      >
                        <h1 className="text-blue-700">
                          No pending quotations found.
                        </h1>
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
                                <p className="text-sm text-gray-600">
                                  {ticket.clientName}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 border border-blue-200"
                                onClick={() => handleQuotationClick(ticket)}
                              >
                                Quotation
                              </Button>
                            </div>

                            {/* Company & Contact Info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Company
                                </p>
                                <p className="text-blue-900">
                                  {ticket.companyName}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Phone
                                </p>
                                <p className="text-blue-900">
                                  {ticket.phoneNumber}
                                </p>
                              </div>
                            </div>

                            {/* Enquiry Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Enquiry Receiver
                                </p>
                                <p className="text-blue-900">
                                  {ticket.enquiryReceiverName || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Warranty
                                </p>
                                <p className="text-blue-900">
                                  {ticket.warrantyCheck || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Machine & Engineer */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Machine Name
                                </p>
                                <p className="text-blue-900">
                                  {ticket.machineName || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Engineer
                                </p>
                                <p className="text-blue-900">
                                  {ticket.engineerAssign || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Enquiry Type & Site */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Enquiry Type
                                </p>
                                <p className="text-blue-900">
                                  {ticket.enquiryType || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Site Name
                                </p>
                                <p className="text-blue-900">
                                  {ticket.siteName || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* OTP Status & Quotation Revice */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  OTP Status
                                </p>
                                <p className="text-blue-900">
                                  {ticket.otpVarificationStatus || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Quotation Revice
                                </p>
                                <p className="text-blue-900">
                                  {ticket.totalQutation !== null &&
                                    ticket.totalQutation !== undefined
                                    ? String(ticket.totalQutation).trim() || "0"
                                    : "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Quotation PDF */}
                            <div className="text-sm">
                              <p className="text-gray-500 font-medium">
                                Quotation PDF
                              </p>
                              {ticket.quotationPdfLink ? (
                                <a
                                  href={ticket.quotationPdfLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View PDF
                                </a>
                              ) : (
                                <p className="text-blue-900">N/A</p>
                              )}
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
                  <table className="hidden sm:block w-full">
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
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Type
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
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
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation No.
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Basic Amount
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Total Amount
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Share By
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Share Through
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation PDF
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {fetchLoading ? (
                        <tr>
                          <td
                            colSpan={23}
                            className="text-center py-8 bg-white"
                          >
                            <div className="flex justify-center items-center text-blue-700">
                              <LoaderIcon className="animate-spin w-8 h-8 mr-2" />
                              <span>Loading quotation history...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredHistoryData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={23}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-history"
                          >
                            <h1 className="text-blue-700">
                              No quotation history found.
                            </h1>
                          </td>
                        </tr>
                      ) : (
                        [...filteredHistoryData]
                          .map((ticket, ind) => (
                            <tr
                              key={ind}
                              className={
                                ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                              }
                            >
                              <td className="px-4 py-3 font-medium text-blue-800">
                                {formatDate(ticket.timeStemp)}
                              </td>
                              <td className="px-4 py-3 font-medium text-blue-800">
                                {ticket.ticketId}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.sourceOfEnquiry || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.callType || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.enquiryReceiverName || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.clientType || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.companyName || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.clientName || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.phoneNumber || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.gstAddress || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.siteAddress || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.gstNo || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.machineName || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.category || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.mentionIssue || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.serviceLocation || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket["quotation_no."] || ticket.quotation_no || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                ₹{ticket.basic_amount || "0"}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                ₹{ticket.total_amount_with_tex || "0"}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket["quotation_share_by_(person_name)_"] ||
                                  ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.share_through || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.quotation_pdf_link ? (
                                  <a
                                    href={ticket.quotation_pdf_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    View PDF
                                  </a>
                                ) : (
                                  ""
                                )}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.remarks || ""}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-4">
                    {fetchLoading ? (
                      <div className="text-center py-8 bg-white">
                        <div className="flex justify-center items-center text-blue-700">
                          <LoaderIcon className="animate-spin w-8 h-8 mr-2" />
                          <span>Loading quotation history...</span>
                        </div>
                      </div>
                    ) : filteredHistoryData.length === 0 ? (
                      <div
                        className="text-center py-8 bg-white"
                        data-testid="text-no-history"
                      >
                        <h1 className="text-blue-700">
                          No quotation history found.
                        </h1>
                      </div>
                    ) : (
                      [...filteredHistoryData].reverse().map((ticket, ind) => (
                        <Card
                          key={ind}
                          className={`${ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                            } border-l-4 border-l-blue-500`}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Header */}
                            <div>
                              <h3 className="font-bold text-blue-800 text-lg">
                                {ticket.ticket_id}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {ticket.client_name}
                              </p>
                            </div>

                            {/* Company & Contact */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Company
                                </p>
                                <p className="text-blue-900">
                                  {ticket.company_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Phone
                                </p>
                                <p className="text-blue-900">
                                  {ticket.phone_number}
                                </p>
                              </div>
                            </div>

                            {/* Quotation Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Quotation No.
                                </p>
                                <p className="text-blue-900">
                                  {ticket["quotation_no."]}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Basic Amount
                                </p>
                                <p className="text-blue-900">
                                  ₹{ticket.basic_amount || "0"}
                                </p>
                              </div>
                            </div>

                            {/* Amount Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Total Amount
                                </p>
                                <p className="text-blue-900 font-semibold">
                                  ₹{ticket.total_amount_with_tex || "0"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Share By
                                </p>
                                <p className="text-blue-900">
                                  {ticket[
                                    "quotation_share_by_(person_name)_"
                                  ] || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Share Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Share Through
                                </p>
                                <p className="text-blue-900">
                                  {ticket.share_through || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Quotation PDF
                                </p>
                                {ticket.quotation_pdf_link ? (
                                  <a
                                    href={ticket.quotation_pdf_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    View PDF
                                  </a>
                                ) : (
                                  <p className="text-blue-900">N/A</p>
                                )}
                              </div>
                            </div>

                            {/* Remarks */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Remarks
                              </p>
                              <p className="text-blue-900 line-clamp-2">
                                {ticket.remarks || "N/A"}
                              </p>
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

      {/* Create Quotation Modal */}
      <Modal
        isOpen={showQuotationModal}
        onClose={() => setShowQuotationModal(false)}
        title="Create Quotation"
        size="2xl"
      >
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-4 pb-4">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
            <div>
              <Label>Ticket ID</Label>
              <Input
                value={formData.ticketId || ""}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div>
              <Label>Client Name</Label>
              <Input
                value={formData.clientName || ""}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={formData.phoneNumber || ""}
                disabled
                className="bg-slate-50"
              />
            </div>

            {!isCancelled && (
              <>
                <div>
                  <Label>Site Address</Label>
                  <Input
                    value={formData.siteAddress || ""}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <div>
                  <Label>Engineer Assign</Label>
                  <select
                    value={formData.engineerAssign || ""}
                    onChange={(e) =>
                      handleInputChange("engineerAssign", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Engineer</option>
                    {masterData[0]?.["Enquiry Receiver Name"]?.map(
                      (engineer) => (
                        <option key={engineer} value={engineer}>
                          {engineer}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <Label>Quotation No.</Label>
                  <Input
                    type="text"
                    placeholder="Enter Quotation No"
                    value={formData.quotationNo || ""}
                    onChange={(e) =>
                      handleInputChange("quotationNo", e.target.value)
                    }
                    data-testid="input-quotation-no"
                  />
                </div>

                {/* Editable fields */}
                <div>
                  <Label>Basic Amount *</Label>
                  <Input
                    type="number"
                    placeholder="Enter basic amount"
                    value={formData.basicAmount || ""}
                    onChange={(e) =>
                      handleInputChange("basicAmount", e.target.value)
                    }
                    data-testid="input-basic-amount"
                  />
                </div>
                <div>
                  <Label>Total Amount with Tax *</Label>
                  <Input
                    type="number"
                    placeholder="Enter total amount"
                    value={formData.totalAmountWithTax || ""}
                    onChange={(e) =>
                      handleInputChange("totalAmountWithTax", e.target.value)
                    }
                    data-testid="input-total-amount"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    Quotation PDF Link *
                    {isUploadingQuotation && (
                      <LoaderIcon className="animate-spin w-4 h-4 text-blue-600" />
                    )}
                  </Label>
                  <Input
                    type="file"
                    disabled={isUploadingQuotation}
                    onChange={handleQuotationChange}
                    data-testid="input-pdf-link"
                  />
                  {isUploadingQuotation && (
                    <p className="text-xs text-blue-600 mt-1">Uploading file, please wait...</p>
                  )}
                  {formData.quotationPdfUrl && (
                    <p className="mt-1 text-sm text-green-600">
                      Uploaded:{" "}
                      <a
                        href={formData.quotationPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-green-800 font-medium"
                      >
                        View File
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <Label>Quotation Share By *</Label>
                  <select
                    value={formData.quotationShareBy || ""}
                    onChange={(e) =>
                      handleInputChange("quotationShareBy", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Share By</option>
                    {masterData[0]?.["Quotation Share by"]?.map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label>Quotation Share *</Label>
                  <select
                    value={formData.quotationShare || ""}
                    onChange={(e) =>
                      handleInputChange("quotationShare", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="select-quotation-share"
                  >
                    <option value="">Select Quotation Share</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex space-x-4 pt-4 sticky bottom-0 bg-white py-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploadingQuotation}
                    data-testid="button-submit-quotation"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
                  >
                    {isSubmitting && <Loader2Icon className="animate-spin" />}
                    Submit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowQuotationModal(false)}
                    data-testid="button-cancel-quotation"
                  >
                    Cancel
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
      </Modal>

      <Modal
        isOpen={showMakeQuotationModal}
        onClose={() => setShowMakeQuotationModal(false)}
        title="Make Quotation"
        size="6xl"
      >
        <MakeQuotation
          ticket={selectedTicket}
          onClose={() => setShowMakeQuotationModal(false)}
        />
      </Modal>
    </div>
  );
}
