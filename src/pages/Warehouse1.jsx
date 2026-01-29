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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Modal } from "../components/ui/modal";
import { storage } from "../lib/storage";
import { useToast } from "../hooks/use-toast";
import { Loader2Icon, LoaderIcon } from "lucide-react";
import { Textarea } from "../components/ui/textarea";

export default function Warehouse1() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingTickets, setPendingTickets] = useState([]);
  const [historyTickets, setHistoryTickets] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchItem, setSearchItem] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  const { toast } = useToast();

  // Add this near your other state declarations
  const [activeServiceTab, setActiveServiceTab] = useState("warehouse");

  const [masterData, setMasterData] = useState({});

  // console.log("masterData",masterData);

  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sheet_url =
    "https://script.google.com/macros/s/AKfycbwMQVO7Wc6LHKgH8sFm5XiH5X7MQqgE1oVvAyQcfHjhjw2APy25zZ4bGUgxp77wUpsl0Q/exec";
  const Sheet_Id = "1S6rZkPWbEAaOL3VnW7z7kidRkhUi9e7BEJM1n08Hhpw";

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
          CREName: row[127],
        }));

        // Filter data based on your conditions

        // console.log("Alldata", allData);

        const pending = allData.filter(
          (item) => item.planned6 !== "" && item.actual6 === ""
        );
        // console.log("pending", pending);

        const history = allData.filter(
          (item) => item.planned6 !== "" && item.actual6 !== ""
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
    const pending = tickets.filter((t) => t.status === "follow-up-completed");
    const history = tickets.filter(
      (t) => t.status === "site-visit-plan-completed"
    );

    setPendingTickets(pending);
    setHistoryTickets(history);
  }, []);

  const handlePlanClick = (ticket) => {
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
      siteName: ticket.siteName || "",
      status: ticket.status || "",
      paymentTerm: ticket.paymentTerm || "",
      againstDelivery: ticket.againstDelivery || "",
      acceptanceVia: ticket.acceptanceVia || "",
      paymentTerms: ticket.paymentTerms || "",
      paymentMode: ticket.paymentMode || "",
      advanceAttachment: ticket.advanceAttachment || "",
      seniorApproval: ticket.seniorApproval || "",
      dateOfVisit: "",
      transportation: "",

      serviceLocation: ticket.serviceLocation || "", // Add this
      // Warehouse fields
      machineReceiverName: ticket.machineReceiverName || "",
      machineReceiverNumber: ticket.machineReceiverNumber || "",
      challanAttachment: ticket.challanAttachment || "",
      invoiceStatus: ticket.invoiceStatus || "",
      // Non-warehouse fields
      spareDetails: ticket.spareDetails || "",
      dnCopyFileUpload: ticket.dnCopyFileUpload || "",
      dnNumber: ticket.dnNumber || "",
      serviceAssets: ticket.serviceAssets || "",
      equipmentNames: ticket.equipmentName
        ? ticket.equipmentName.split(",")
        : [],
      attachment: ticket.attachment || "",
    });
    setShowPlanModal(true);
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

    setIsSubmitting(true);
    let dnCopyFileUploadFile = "";
    let attachmentFile = "";
    let challanAttachmentFile = "";

    // console.log(
    //   "formData.acceptanceAttachemntFile",
    //   formData.acceptanceAttachemntFile
    // );
    // console.log(
    //   "formData.approvalAttachmentFile",
    //   formData.approvalAttachmentFile
    // );

    if (formData.dnCopyFile) {
      const uploadResult = await uploadImageToDrive(formData.dnCopyFile);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }
      dnCopyFileUploadFile = uploadResult.fileUrl;
    }

    if (formData.attachment) {
      const uploadResult = await uploadImageToDrive(formData.attachment);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }
      attachmentFile = uploadResult.fileUrl;
    }

    if (formData.challenAttachment) {
      const uploadResult = await uploadImageToDrive(formData.challenAttachment);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }
      challanAttachmentFile = uploadResult.fileUrl;
    }

    // console.log("challanAttachmentFile", challanAttachmentFile);
    // console.log("equipmentNamesString", equipmentNamesString);

    // Convert equipmentNames array to a comma-separated string
    const equipmentNamesString = formData.equipmentNames
      ? formData.equipmentNames.join(", ")
      : "";

    const currentDateTime = formatDateTime(new Date());
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
            BP: currentDateTime,
            // BQ: formData.transportation || "",
            BR: formData.spareDetails || "",
            BS: dnCopyFileUploadFile || "",
            BT: formData.dnNumber || "",
            BU: formData.serviceAssets || "",
            BV: equipmentNamesString || "",
            BW: attachmentFile || "",
            BX: formData.machineReceiverName || "",
            BY: formData.machineReceiverNumber || "",
            BZ: challanAttachmentFile || "",
            CA: formData.invoiceStatus || "",
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
            actual5: currentDateTime,
            dateOfVisit: formData.dateOfVisit,
            transportation: formData.transportation,
          },
          ...prevHistory,
        ]);

        toast({
          title: "Success",
          description: "Ticket details saved successfully",
        });
        setShowPlanModal(false);
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
        "Warehouse1", // Enquiry Type (second one)
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

        setAllPendingData((prevAllPending) =>
          prevAllPending.filter(
            (ticket) => ticket.ticketId !== selectedTicket.ticketId
          )
        );
        setShowPlanModal(false);
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

  const [allPendingData, setAllPendingData] = useState([]);
  const [allHistoryData, setAllHistoryData] = useState([]);

  useEffect(() => {
    if (activeServiceTab === "warehouse") {
      const fillteredPending = pendingData.filter(
        (item) =>
          item.serviceLocation === "Warehouse" ||
          item.serviceLocation === "Other"
      );
      const fillteredHistory = historyData.filter(
        (item) =>
          item.serviceLocation === "Warehouse" ||
          item.serviceLocation === "Other"
      );
      setAllPendingData(fillteredPending);
      setAllHistoryData(fillteredHistory);
    } else {
      const fillteredPending = pendingData.filter(
        (item) => item.serviceLocation === "On-Site"
      );
      const fillteredHistory = historyData.filter(
        (item) => item.serviceLocation === "On-Site"
      );
      setAllPendingData(fillteredPending);
      setAllHistoryData(fillteredHistory);
    }
  }, [activeServiceTab, pendingData, historyData]);

  const filteredPendingDataa = allPendingData
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

  const filteredHistoryDataa = allHistoryData
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

  // console.log("filteredPendingDataa", filteredPendingDataa);
  // console.log("filteredHistoryDataa", filteredHistoryDataa);

  return (
    <div className="space-y-2">
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex gap-10">
          {/* tab for pending and history */}
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

          {/* tab for warehouse and on-site */}

          <div className="grid w-full grid-cols-2 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-lg border border-blue-200">
            <div
              onClick={() => setActiveServiceTab("warehouse")}
              className={`${activeServiceTab === "warehouse" &&
                "bg-blue-700 text-white font-medium shadow-sm"
                }  rounded-md py-2 transition-all duration-300 cursor-pointer`}
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1a1 1 0 00-1 1v1a1 1 0 002 0V2a1 1 0 00-1-1zM5.05 3.05a7 7 0 119.9 9.9 1 1 0 00-1.414-1.414 5 5 0 10-7.072-7.072A1 1 0 105.05 3.05zm9.9 9.9a7 7 0 01-9.9-9.9 1 1 0 112.828-2.828 5 5 0 107.072 7.072 1 1 0 11-1.414 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Warehouse
              </span>
            </div>

            <div
              onClick={() => setActiveServiceTab("onsite")}
              className={`${activeServiceTab === "onsite" &&
                "bg-blue-700 text-white font-medium shadow-sm"
                }  rounded-md py-2 transition-all duration-300 cursor-pointer`}
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                On-Site
              </span>
            </div>
          </div>
        </div>

        <TabsContent value="pending">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Pending Site Visit Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="hidden sm:block w-full">
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
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Site Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Payment term
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Acceptance Via
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Payment Mode
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Senior Approval
                        </th>
                      </tr>
                    </thead>
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
                                No pending site visit plans found.
                              </h1>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredPendingData.map((ticket, indx) => (
                          <tr
                            key={indx}
                            className={
                              indx % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                            }
                          >
                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                onClick={() => handlePlanClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 transition-all duration-300 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md group"
                                data-testid={`button-plan-${ticket.ticketId}`}
                              >
                                <span className="font-medium">PLAN</span>
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
                              {ticket.siteName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.paymentTerm}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.acceptanceVia}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.paymentMode || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.seniorApproval || ""}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Card View */}
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
                            No pending site visit plans found.
                          </h1>
                        )}
                      </div>
                    ) : (
                      filteredPendingData.map((ticket, indx) => (
                        <Card
                          key={indx}
                          className={`${indx % 2 === 0 ? "bg-blue-50/50" : "bg-white"
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
                                onClick={() => handlePlanClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 border border-blue-200"
                              >
                                PLAN
                              </Button>
                            </div>

                            {/* Contact & Receiver Info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Phone
                                </p>
                                <p className="text-blue-900">
                                  {ticket.phoneNumber}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Enquiry Receiver
                                </p>
                                <p className="text-blue-900">
                                  {ticket.enquiryReceiverName}
                                </p>
                              </div>
                            </div>

                            {/* Technical Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Warranty
                                </p>
                                <p className="text-blue-900">
                                  {ticket.warrantyCheck}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Machine
                                </p>
                                <p className="text-blue-900">
                                  {ticket.machineName || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Engineer & Site */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Engineer
                                </p>
                                <p className="text-blue-900">
                                  {ticket.engineerAssign || "N/A"}
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

                            {/* Enquiry Type */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Enquiry Type
                              </p>
                              <p className="text-blue-900">
                                {ticket.enquiryType}
                              </p>
                            </div>

                            {/* Payment Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Payment Term
                                </p>
                                <p className="text-blue-900">
                                  {ticket.paymentTerm}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Payment Mode
                                </p>
                                <p className="text-blue-900">
                                  {ticket.paymentMode || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Acceptance & Approval */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Acceptance Via
                                </p>
                                <p className="text-blue-900">
                                  {ticket.acceptanceVia}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Senior Approval
                                </p>
                                <p className="text-blue-900">
                                  {ticket.seniorApproval || "N/A"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Site Visit Plan History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="hidden sm:block w-full">
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

                        {/* Show these columns only for On-Site tab */}
                        {activeServiceTab === "onsite" && (
                          <>
                            <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                              Spare Details
                            </th>
                            <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                              DN Copy file upload
                            </th>
                            <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                              DN Number
                            </th>
                            <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                              Service Assets
                            </th>
                            <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                              Equipment Name
                            </th>
                            <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                              Attachment
                            </th>
                          </>
                        )}

                        {/* Show these columns only for Warehouse tab */}
                        {activeServiceTab === "warehouse" && (
                          <>
                            <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                              Machine Receiver Name
                            </th>
                            <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                              Machine Receiver Number
                            </th>
                            <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                              Challan Attachment
                            </th>
                            <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                              Invoice Status
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredHistoryData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={activeServiceTab === "warehouse" ? 8 : 14}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-history"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No site visit plan history found.
                              </h1>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredHistoryData.map((ticket, indx) => (
                          <tr
                            key={indx}
                            className={
                              indx % 2 === 0 ? "bg-blue-50/50" : "bg-white"
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

                            {/* Show these columns only for On-Site tab */}
                            {activeServiceTab === "onsite" && (
                              <>
                                <td className="px-4 py-3 text-blue-900">
                                  {ticket.spareDetails || ""}
                                </td>
                                <td className="px-4 py-3 text-blue-900">
                                  {ticket.dnCopyFileUpload ? (
                                    <a
                                      href={ticket.dnCopyFileUpload}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      View
                                    </a>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td className="px-4 py-3 text-blue-900">
                                  {ticket.dnNumber || ""}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {ticket.serviceAssets || ""}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-blue-900">
                                  {ticket.equipmentName || ""}
                                </td>
                                <td className="px-4 py-3 text-blue-900">
                                  {ticket.attachment ? (
                                    <a
                                      href={ticket.attachment}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      View
                                    </a>
                                  ) : (
                                    ""
                                  )}
                                </td>
                              </>
                            )}

                            {/* Show these columns only for Warehouse tab */}
                            {activeServiceTab === "warehouse" && (
                              <>
                                <td className="px-4 py-3 text-blue-900">
                                  {ticket.machineReceiverName || ""}
                                </td>
                                <td className="px-4 py-3 text-blue-900">
                                  {ticket.machineReceiverNumber || ""}
                                </td>
                                <td className="px-4 py-3 text-blue-900">
                                  {ticket.challanAttachment ? (
                                    <a
                                      href={ticket.challanAttachment}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      View
                                    </a>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td className="px-4 py-3 text-blue-900">
                                  {ticket.invoiceStatus || ""}
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Card View */}
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
                            No site visit plan history found.
                          </h1>
                        )}
                      </div>
                    ) : (
                      filteredHistoryData.map((ticket, indx) => (
                        <Card
                          key={indx}
                          className={`${indx % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                            } border-l-4 border-l-blue-500`}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Header */}
                            <div>
                              <h3 className="font-bold text-blue-800 text-lg">
                                {ticket.ticketId}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {ticket.clientName}
                              </p>
                            </div>

                            {/* Contact & Machine Info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Phone
                                </p>
                                <p className="text-blue-900">
                                  {ticket.phoneNumber}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Machine
                                </p>
                                <p className="text-blue-900">
                                  {ticket.machineName || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* On-Site Specific Information */}
                            {activeServiceTab === "onsite" && (
                              <>
                                <div>
                                  <p className="text-gray-500 font-medium text-sm">
                                    Spare Details
                                  </p>
                                  <p className="text-blue-900 line-clamp-2">
                                    {ticket.spareDetails || "N/A"}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500 font-medium">
                                      DN Number
                                    </p>
                                    <p className="text-blue-900">
                                      {ticket.dnNumber || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 font-medium">
                                      Service Assets
                                    </p>
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                      {ticket.serviceAssets || "N/A"}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-gray-500 font-medium text-sm">
                                    Equipment Name
                                  </p>
                                  <p className="text-blue-900">
                                    {ticket.equipmentName || "N/A"}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500 font-medium">
                                      DN Copy
                                    </p>
                                    {ticket.dnCopyFileUpload ? (
                                      <a
                                        href={ticket.dnCopyFileUpload}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                      >
                                        View File
                                      </a>
                                    ) : (
                                      <p className="text-blue-900">N/A</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-gray-500 font-medium">
                                      Attachment
                                    </p>
                                    {ticket.attachment ? (
                                      <a
                                        href={ticket.attachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                      >
                                        View File
                                      </a>
                                    ) : (
                                      <p className="text-blue-900">N/A</p>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Warehouse Specific Information */}
                            {activeServiceTab === "warehouse" && (
                              <>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500 font-medium">
                                      Receiver Name
                                    </p>
                                    <p className="text-blue-900">
                                      {ticket.machineReceiverName || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 font-medium">
                                      Receiver Number
                                    </p>
                                    <p className="text-blue-900">
                                      {ticket.machineReceiverNumber || "N/A"}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500 font-medium">
                                      Invoice Status
                                    </p>
                                    <p className="text-blue-900">
                                      {ticket.invoiceStatus || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 font-medium">
                                      Challan
                                    </p>
                                    {ticket.challanAttachment ? (
                                      <a
                                        href={ticket.challanAttachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                      >
                                        View Challan
                                      </a>
                                    ) : (
                                      <p className="text-blue-900">N/A</p>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Site Visit Plan Modal */}

      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title="Warehouse 1"
        size="4xl"
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2 mb-10">
            <input
              type="checkbox"
              id="cancelTicket"
              checked={isCancelled}
              onChange={(e) => setIsCancelled(e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <Label htmlFor="cancelTicket" className="text-red-600 font-medium">
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
          <div>
            <Label>Engineer Assign</Label>
            <Input
              value={formData.engineerAssign || ""}
              disabled
              className="bg-slate-50"
            />
          </div>

          {!isCancelled && (
            <>
              {selectedTicket?.serviceLocation === "Warehouse" ? (
                <>
                  <div>
                    <Label>Machine Receiver Name</Label>
                    <Input
                      value={formData.machineReceiverName || ""}
                      onChange={(e) =>
                        handleInputChange("machineReceiverName", e.target.value)
                      }
                      placeholder="Enter machine receiver name"
                    />
                  </div>
                  <div>
                    <Label>Machine Receiver Number</Label>
                    <Input
                      value={formData.machineReceiverNumber || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "machineReceiverNumber",
                          e.target.value
                        )
                      }
                      placeholder="Enter machine receiver number"
                    />
                  </div>
                  <div>
                    <Label>Challen Attachment</Label>
                    <Input
                      type="file"
                      onChange={(e) =>
                        handleInputChange(
                          "challenAttachment",
                          e.target.files[0]
                        )
                      }
                      data-testid="challen-attachment"
                    />
                  </div>
                  <div>
                    <Label>Invoice Status</Label>
                    <Select
                      value={formData.invoiceStatus || ""}
                      onValueChange={(value) =>
                        handleInputChange("invoiceStatus", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select invoice status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Spare Details</Label>
                    <Input
                      value={formData.spareDetails || ""}
                      onChange={(e) =>
                        handleInputChange("spareDetails", e.target.value)
                      }
                      placeholder="Enter spare details"
                    />
                  </div>
                  <div>
                    <Label>DN Copy File Upload</Label>
                    <Input
                      type="file"
                      onChange={(e) =>
                        handleInputChange("dnCopyFile", e.target.files[0])
                      }
                      data-testid="dn-copy-file"
                    />
                  </div>
                  <div>
                    <Label>DN Number</Label>
                    <Input
                      value={formData.dnNumber || ""}
                      onChange={(e) =>
                        handleInputChange("dnNumber", e.target.value)
                      }
                      placeholder="Enter DN number"
                    />
                  </div>
                  <div>
                    <Label>Service Assets</Label>
                    <Input
                      value={formData.serviceAssets || ""}
                      onChange={(e) =>
                        handleInputChange("serviceAssets", e.target.value)
                      }
                      placeholder="Enter service assets"
                    />
                  </div>

                  {/* <div className="md:col-span-2">
                    <Label>Equipment Name</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {masterData.length > 0 &&
                        masterData[0]["Equipment Name"]?.map((equipment) => (
                          <div
                            key={equipment}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={equipment}
                              checked={
                                formData.equipmentNames?.includes(equipment) ||
                                false
                              }
                              onChange={(e) => {
                                const selected = formData.equipmentNames || [];
                                if (e.target.checked) {
                                  handleInputChange("equipmentNames", [
                                    ...selected,
                                    equipment,
                                  ]);
                                } else {
                                  handleInputChange(
                                    "equipmentNames",
                                    selected.filter(
                                      (item) => item !== equipment
                                    )
                                  );
                                }
                              }}
                            />
                            <label htmlFor={equipment}>{equipment}</label>
                          </div>
                        ))}
                    </div>
                  </div> */}

                  <div className="md:col-span-2">
                    <Label>Equipment Name</Label>
                    <Select
                      onValueChange={(value) => {
                        const selected = formData.equipmentNames || [];
                        if (selected.includes(value)) {
                          handleInputChange(
                            "equipmentNames",
                            selected.filter((item) => item !== value)
                          );
                        } else {
                          handleInputChange("equipmentNames", [
                            ...selected,
                            value,
                          ]);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select equipment names">
                          {formData.equipmentNames?.length > 0
                            ? `${formData.equipmentNames.length} selected`
                            : "Select equipment names"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {masterData.length > 0 &&
                          masterData[0]["Equipment Name"]?.map((equipment) => (
                            <SelectItem key={equipment} value={equipment}>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.equipmentNames?.includes(
                                      equipment
                                    ) || false
                                  }
                                  readOnly
                                  className="mr-2"
                                />
                                {equipment}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {formData.equipmentNames?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {formData.equipmentNames.map((equipment) => (
                          <span
                            key={equipment}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md flex items-center"
                          >
                            {equipment}
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange(
                                  "equipmentNames",
                                  formData.equipmentNames.filter(
                                    (item) => item !== equipment
                                  )
                                );
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Attachment</Label>
                    <Input
                      type="file"
                      onChange={(e) =>
                        handleInputChange("attachment", e.target.files[0])
                      }
                      data-testid="attachment"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex space-x-4 pt-4">
                <Button
                  type="submit"
                  data-testid="button-submit-followup"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
                >
                  {isSubmitting && <Loader2Icon className="animate-spin" />}
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPlanModal(false)}
                  data-testid="button-cancel-followup"
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
      </Modal>
    </div>
  );
}
