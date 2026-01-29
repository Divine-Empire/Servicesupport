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
import { Loader2Icon, LoaderIcon } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function Invoice() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingTickets, setPendingTickets] = useState([]);
  const [historyTickets, setHistoryTickets] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
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
  const [headersData, setHeaddersData] = useState([]);

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
          followUpAttachment: row[60],

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

          planned9: row[91],
          actual9: row[92],
          delay9: row[93],
          sitevisitName: row[94],
          lastBalance: row[95],
          payRightNow: row[96],
          billFile: row[97],
          siteVisitByAccountRemarks: row[98],

          planned10: row[99],
          actual10: row[100],
          delay10: row[101],
          sitevisitDate: row[102],
          otpVerification: row[103],
          verificationStatus: row[104],

          planned11: row[105],
          actual11: row[106],
          delay11: row[107],
          serviceReportFile: row[108],
          engineerRemarks: row[109],
          quatationReceive: row[110],

          planned12: row[111],
          actual12: row[112],
          delay12: row[113],

          CREName: row[127],
        }));

        // Filter data based on your conditions

        // console.log("Alldata", allData);

        const pending = allData.filter(
          (item) => item.planned12 !== "" && item.actual12 === ""
        );
        // console.log("pending", pending);

        setPendingData(pending);
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

  const fetchInvoiceSheet = async () => {
    setFetchLoading(true); // start loading
    try {
      const response = await fetch(`${sheet_url}?sheet=Invoice`);
      const json = await response.json();

      setHeaddersData(json);

      if (json.success && Array.isArray(json.data)) {
        // Process the data to match your requirements
        const allData = json.data.slice(6).map((row, index) => ({
          id: index + 1,
          timeStemp: row[0], // Timestamp
          ticketId: row[1], // Ticket ID
          quotationNo: row[2], // Quotation No.(input)
          clientName: row[3], // Client Name
          phoneNumber: row[4], // Phone Number
          emailAddress: row[5], // Email Address
          invoiceCategory: row[6], // Email Address
          companyName: row[7], // Company Name
          quotationPdfLink: row[8], // Quotation Pdf link

          invoicePostedBy: row[9], // Invoice Posted By(Drop-Down)
          invoiceNoNABL: row[10], // Invoice No (NABL) (Manual)
          invoiceNoSERVICE: row[11], // Invoice No (SERVICE)
          invoiceNoSPARE: row[12], // Invoice No (SPARE)
          spareInvoice: row[13], // SPARE INVOICE
          serviceInvoice: row[14], // SERVICE INVOICE
          nablInvoice: row[15], // NABL INVOICE
          nonNabl: row[16], // NON NABL
          invoiceAmountNABLBasic: row[17], // Invoice Amount NABL (Basic)
          invoiceAmountNABLGst: row[18], // Invoice Amount NABL (gst)
          totalInvoiceAmtNonNABLBasic: row[19], // Total Invoice Amt NON NABL BASIC
          totalInvoiceAmtNonNABLGst: row[20], // Total Invoice Amt NON NABL gst
          serviceAmountBasic: row[21], // Service Amount (Basic)

          totalServiceAmtSpare: row[22], // Total Service Amt (spare)
          totalServiceAmtSpareGst: row[23], // Total Service Amt (spare) gst

          attachmentService: row[24], // Attachment Service
          attachmentSpear: row[25], // Attachment Spear
          attachmentNABL: row[26], // Attachment NABL

          billNo: row[27], // Attachment NABL
          billFile: row[28], // Attachment NABL
          basicAmount: row[29], // Attachment NABL
          totalAmountWithTex: row[30], // Attachment NABL
          CREName: row[73],
        }));

        // Filter data based on your conditions

        // console.log("Alldata", allData);

        const history = allData;
        setHistoryData(history);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterSheet();
    fetchData();
    fetchInvoiceSheet();
  }, []);

  useEffect(() => {
    const tickets = storage.getTickets();
    const pending = tickets.filter(
      (t) => t.status === "engineer-approval-completed"
    );
    const history = tickets.filter((t) => t.status === "invoice-completed");

    setPendingTickets(pending);
    setHistoryTickets(history);
  }, []);

  const handleInvoiceClick = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      ticketId: ticket.ticketId,
      quotationNo: ticket.quotationNo || `QT-${ticket.id}`,
      clientName: ticket.clientName,
      phoneNumber: ticket.phoneNumber,
      emailAddress: ticket.emailAddress || "",
      category: ticket.category || "",
      companyName: ticket.companyName || "",
      quotationPdfLink: ticket.quotationPdfLink || "",

      invoicePostedBy: "",
      invoiceNoNABL: "",
      invoiceNoSERVICE: "",
      invoiceNoSPARE: "",
      spareInvoice: "",
      serviceInvoice: "",
      nablInvoice: "",
      nonNabl: "",
      invoiceAmountNABLBasic: "",
      invoiceAmountNABLGst: "",
      totalInvoiceAmtNonNABLBasic: "",
      totalInvoiceAmtNonNABLGst: "",
      serviceAmountBasic: "",
      serviceAmountGST: "",
      totalServiceAmtSpare: "",
      totalServiceAmtSpareGst: "",
      totalAmtWithGST: "",
      attachmentService: "",
      attachmentSpear: "",
      attachmentNABL: "",
    });
    setShowInvoiceModal(true);
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

  function generateSixDigitNumber() {
    let result = "";
    for (let i = 0; i < 6; i++) {
      // Generate a random digit between 0 and 9
      const digit = Math.floor(Math.random() * 10).toString();
      result += digit.toString();
    }
    return result;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First fetch the headers to understand column order
      // const headersResponse = await fetch(`${sheet_url}?sheet=Invoice`);
      // const headersData = await headersResponse.json();

      // if (!headersData.success || !headersData.data) {
      //   throw new Error("Could not fetch headers");
      // }

      // Find the header row (look for "Timestamp" in first column)
      const headerRowIndex = headersData.data.findIndex(
        (row) => row[0] === "Timestamp"
      );

      if (headerRowIndex === -1) {
        throw new Error("Could not find header row in data");
      }

      const headers = headersData.data[headerRowIndex];

      // Handle file uploads
      let attachmentServicefileUrl = "";
      let attachmentSpearServicefileUrl = "";
      let attachmentNABLServicefileUrl = "";

      if (formData.attachmentService) {
        const uploadResult = await uploadImageToDrive(
          formData.attachmentService
        );
        if (!uploadResult.success)
          throw new Error(uploadResult.error || "Failed to upload image");
        attachmentServicefileUrl = uploadResult.fileUrl;
      }

      if (formData.attachmentSpear) {
        const uploadResult = await uploadImageToDrive(formData.attachmentSpear);
        if (!uploadResult.success)
          throw new Error(uploadResult.error || "Failed to upload image");
        attachmentSpearServicefileUrl = uploadResult.fileUrl;
      }

      if (formData.attachmentNABL) {
        const uploadResult = await uploadImageToDrive(formData.attachmentNABL);
        if (!uploadResult.success)
          throw new Error(uploadResult.error || "Failed to upload image");
        attachmentNABLServicefileUrl = uploadResult.fileUrl;
      }

      const sixDigitNumber = generateSixDigitNumber();

      // Create the complete ticket object with all fields
      const newTicket = {
        Timestamp: formatDateTime(new Date()),
        "Ticket ID": selectedTicket.ticketId,
        "Quotation No.(input)": formData.quotationNo,
        "Client Name": formData.clientName,
        "Phone Number": formData.phoneNumber,
        "Email Address": formData.emailAddress,
        Category: formData.category,
        "Company Name": formData.companyName,
        "Quotation Pdf link": formData.quotationPdfLink,

        "Invoice Posted By(Drop-Down)": formData.invoicePostedBy,
        "Invoice No (NABL) (Manual)": formData.invoiceNoNABL,
        "Invoice No (SERVICE)": formData.invoiceNoSERVICE,
        "Invoice No (SPARE)": formData.invoiceNoSPARE,
        "Invoice Amount SPARE (gst)": formData.totalAmtWithGST,
        "Invoice Amount SERVICE (gst)": formData.serviceAmountGST,
        // "NABL INVOICE": formData.nablInvoice,
        // "NON NABL": formData.nonNabl,
        "Invoice Amount NABL (Basic)": formData.invoiceAmountNABLBasic,
        "Invoice Amount NABL (gst)": formData.invoiceAmountNABLGst,
        // "Total Invoice Amt NON NABL BASIC":
        // formData.totalInvoiceAmtNonNABLBasic,
        // "Total Invoice Amt NON NABL gst": formData.totalInvoiceAmtNonNABLGst,
        "Service Amount (Basic)": formData.serviceAmountBasic,

        "Total Service Amt (spare)": formData.totalServiceAmtSpare,
        // "Total Service Amt (spare) gst": formData.totalServiceAmtSpareGst,

        "Attachment Service": attachmentServicefileUrl,
        "Attachment Spear": attachmentSpearServicefileUrl,
        "Attachment NABL": attachmentNABLServicefileUrl,
        "Bill NO": selectedTicket.billNumberInput,
        "Bill Copy": selectedTicket.billFile,
        "Basic Amount": selectedTicket.basicAmount,
        "Total Amount with tex": selectedTicket.totalAmoutWithTex,
        OTP: sixDigitNumber,
      };

      // Build rowData in exact same order as headers
      const rowData = headers.map((header) => {
        // Return empty string if header doesn't exist in newTicket
        return newTicket[header] || "";
      });

      const response = await fetch(sheet_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          sheetName: "Invoice",
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

        // Add to history with all the new data
        setHistoryData((prevHistory) => [
          {
            ...newTicket,
            id: selectedTicket.id, // Keep the same ID for consistency
            timeStemp: newTicket["Timestamp"],
            ticketId: newTicket["Ticket ID"],
            quotationNo: newTicket["Quotation No.(input)"],
            clientName: newTicket["Client Name"],
            phoneNumber: newTicket["Phone Number"],
            emailAddress: newTicket["Email Address"],
            category: newTicket["Category"],
            companyName: newTicket["Company Name"],
            quotationPdfLink: newTicket["Quotation Pdf link"],

            invoicePostedBy: newTicket["Invoice Posted By(Drop-Down)"],
            invoiceNoNABL: newTicket["Invoice No (NABL) (Manual)"],
            invoiceNoSERVICE: newTicket["Invoice No (SERVICE)"],
            invoiceNoSPARE: newTicket["Invoice No (SPARE)"],
            spareInvoice: newTicket["SPARE INVOICE"],
            serviceInvoice: newTicket["SERVICE INVOICE"],
            nablInvoice: newTicket["NABL INVOICE"],
            nonNabl: newTicket["NON NABL"],
            invoiceAmountNABLBasic: newTicket["Invoice Amount NABL (Basic)"],
            invoiceAmountNABLGst: newTicket["Invoice Amount NABL (gst)"],
            totalInvoiceAmtNonNABLBasic:
              newTicket["Total Invoice Amt NON NABL BASIC"],
            totalInvoiceAmtNonNABLGst:
              newTicket["Total Invoice Amt NON NABL gst"],
            serviceAmountBasic: newTicket["Service Amount (Basic)"],

            totalServiceAmtSpare: newTicket["Total Service Amt (spare)"],
            totalServiceAmtSpareGst: newTicket["Total Service Amt (spare) gst"],

            attachmentService: newTicket["Attachment Service"],
            attachmentSpear: newTicket["Attachment Spear"],
            attachmentNABL: newTicket["Attachment NABL"],
            billNo: newTicket["Bill NO"],
            billFile: newTicket["Bill Copy"],
            basicAmount: newTicket["Basic Amount"],
            totalAmoutWithTex: newTicket["Total Amount with tex"],
            otpVarificationStatus: newTicket["OTP"],
          },
          ...prevHistory,
        ]);

        setShowInvoiceModal(false);
        setFormData({
          clientName: "",
          phoneNumber: "",
          emailAddress: "",
          category: "",
          priority: "",
          title: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
        });

        toast({
          title: "Success",
          description: `Submitted successfully`,
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
      setIsSubmitting(false);
      setShowInvoiceModal(false);
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
        "Invoice", // Enquiry Type (second one)
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
        setShowInvoiceModal(false);
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

  const filteredPendingDataa = pendingData
    .filter((item) => {
      const phoneNumberStr = String(item.phoneNumber || "");
      const quotationNoStr = String(item.quotationNo || "");
      const matchesSearch =
        item.ticketId?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.companyName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        quotationNoStr?.toLowerCase().includes(searchItem.toLowerCase()) ||
        phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase());
      return matchesSearch;
    })
    .reverse();

  const filteredHistoryDataa = historyData
    .filter((item) => {
      const phoneNumberStr = String(item.phoneNumber || "");
      const quotationNoStr = String(item.quotationNo || "");
      const matchesSearch =
        item.ticketId?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.companyName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        quotationNoStr?.toLowerCase().includes(searchItem.toLowerCase()) ||
        phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase());
      return matchesSearch;
    })
    .reverse();

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

  // console.log("filteredPendingDataa", filteredPendingDataa);
  // console.log("filteredHistoryDataa", filteredHistoryDataa);

  return (
    <div className="space-y-2 sm:space-y-6">
      {/* Filter Options */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="sm:pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full">
              <Label
                htmlFor="searchFilter"
                className="text-sm font-medium text-blue-700"
              >
                Search (Ticket ID, Client, Company, Phone, Quotation No.)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="searchFilter"
                  placeholder="Search by ticket ID, client, company, phone or quotation no..."
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
              <CardTitle className="text-blue-800">Pending Invoices</CardTitle>
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
                          Quotation No.
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Phone Number
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Company Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation Pdf Link
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          PAYMENT TERM
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Acceptance Via
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Acceptance Attachments
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          PAYMENT MODE
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Senior approval
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Approval Attachment
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Attachment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredPendingData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-pending"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No pending invoices found.
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
                                onClick={() => handleInvoiceClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 transition-all duration-300 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md group"
                                data-testid={`button-invoice-${ticket.ticketId}`}
                              >
                                <span className="font-medium">Invoice</span>
                              </Button>
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {ticket.ticketId}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.quotationNo}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.phoneNumber || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.companyName || ""}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.quotationPdfLink ? (
                                <a
                                  href={ticket.quotationPdfLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View PDF
                                </a>
                              ) : (
                                ""
                              )}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.paymentTerm || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.acceptanceVia || ""}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.acceptanceAttachemntFile ? (
                                <a
                                  href={ticket.acceptanceAttachemntFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View PDF
                                </a>
                              ) : (
                                ""
                              )}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.paymentMode || ""}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.seniorApproval || ""}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.approvalAttachmentFile ? (
                                <a
                                  href={ticket.approvalAttachmentFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View PDF
                                </a>
                              ) : (
                                ""
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.followUpAttachment ? (
                                <a
                                  href={ticket.followUpAttachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
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
                            No pending invoices found.
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
                                <p className="text-sm text-gray-600">
                                  {ticket.clientName}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleInvoiceClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 border border-blue-200"
                              >
                                Invoice
                              </Button>
                            </div>

                            {/* Quotation & Contact Info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Quotation No.
                                </p>
                                <p className="text-blue-900">
                                  {ticket.quotationNo}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Phone
                                </p>
                                <p className="text-blue-900">
                                  {ticket.phoneNumber || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Company Name */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Company Name
                              </p>
                              <p className="text-blue-900">
                                {ticket.companyName || "N/A"}
                              </p>
                            </div>

                            {/* Payment Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Payment Term
                                </p>
                                <p className="text-blue-900">
                                  {ticket.paymentTerm || "N/A"}
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
                                  {ticket.acceptanceVia || "N/A"}
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

                            {/* Document Links */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Quotation PDF
                                </p>
                                {ticket.quotationPdfLink ? (
                                  <a
                                    href={ticket.quotationPdfLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    View PDF
                                  </a>
                                ) : (
                                  <p className="text-blue-900 text-xs">N/A</p>
                                )}
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Acceptance Attach.
                                </p>
                                {ticket.acceptanceAttachemntFile ? (
                                  <a
                                    href={ticket.acceptanceAttachemntFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    View PDF
                                  </a>
                                ) : (
                                  <p className="text-blue-900 text-xs">N/A</p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Approval Attach.
                                </p>
                                {ticket.approvalAttachmentFile ? (
                                  <a
                                    href={ticket.approvalAttachmentFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    View PDF
                                  </a>
                                ) : (
                                  <p className="text-blue-900 text-xs">N/A</p>
                                )}
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Follow-up Attach.
                                </p>
                                {ticket.followUpAttachment ? (
                                  <a
                                    href={ticket.followUpAttachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    View PDF
                                  </a>
                                ) : (
                                  <p className="text-blue-900 text-xs">N/A</p>
                                )}
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
              <CardTitle className="text-blue-800">Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="hidden sm:block w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Ticket ID
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation No
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Phone Number
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Category
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Company Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation PDF
                        </th>
                        {/* <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Advance Attachment
                        </th> */}
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Invoice Posted By(Drop-Down)
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Invoice No (NABL) (Manual)
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Invoice No (SERVICE)
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Invoice No (SPARE)
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          SPARE INVOICE
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          SERVICE INVOICE
                        </th>
                        {/* <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          NABL INVOICE
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          NON NABL
                        </th> */}

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Invoice Amount NABL (Basic)
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Invoice Amount NABL (gst)
                        </th>

                        {/* <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Total Invoice Amt NON NABL BASIC
                        </th> */}

                        {/* <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Total Invoice Amt NON NABL gst
                        </th> */}

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Service Amount (Basic)
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Total Service Amt (spare)
                        </th>

                        {/* <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Total Service Amt (spare) gst
                        </th> */}

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Attachment Service
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Attachment Spear
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Attachment NABL
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Bill NO
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Bill File
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Basic Amount
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Total Amount with tex
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          PAYMENT TERM
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Acceptance Via
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Acceptance Attachments
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          PAYMENT MODE
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Senior approval
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Approval Attachment
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Attachment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredHistoryData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={28}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-history"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No invoice history found.
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
                              {ticket.ticketId || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.quotationNo || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.phoneNumber || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.invoiceCategory || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.companyName || ""}
                            </td>
                            <td className="px-4 py-3">
                              {ticket.quotationPdfLink ? (
                                <a
                                  href={ticket.quotationPdfLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View
                                </a>
                              ) : (
                                ""
                              )}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.invoicePostedBy || ""}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.invoiceNoNABL || ""}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.invoiceNoSERVICE || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.invoiceNoSPARE || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.spareInvoice || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.serviceInvoice || ""}
                            </td>

                            {/* <td className="px-4 py-3 text-blue-900">
                              {ticket.nablInvoice || ""}
                            </td> */}
                            {/* <td className="px-4 py-3 text-blue-900">
                              {ticket.nonNabl || ""}
                            </td> */}
                            <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.invoiceAmountNABLBasic || "0"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.invoiceAmountNABLGst || "0"}
                            </td>
                            {/* <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.totalInvoiceAmtNonNABLBasic || "0"}
                            </td> */}
                            {/* <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.totalInvoiceAmtNonNABLGst || "0"}
                            </td> */}
                            <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.serviceAmountBasic || "0"}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.totalServiceAmtSpare || "0"}
                            </td>
                            {/* <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.totalServiceAmtSpareGst || "0"}
                            </td> */}

                            <td className="px-4 py-3">
                              {ticket.attachmentService ? (
                                <a
                                  href={ticket.attachmentService}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View
                                </a>
                              ) : (
                                ""
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {ticket.attachmentSpear ? (
                                <a
                                  href={ticket.attachmentSpear}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View
                                </a>
                              ) : (
                                ""
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {ticket.attachmentNABL ? (
                                <a
                                  href={ticket.attachmentNABL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View
                                </a>
                              ) : (
                                ""
                              )}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.billNo || "0"}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.billFile ? (
                                <a
                                  href={ticket.billFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View
                                </a>
                              ) : (
                                ""
                              )}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.basicAmount || "0"}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              ₹{ticket.totalAmountWithTex || "0"}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.paymentTerm || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.acceptanceVia || ""}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.acceptanceAttachemntFile ? (
                                <a
                                  href={ticket.acceptanceAttachemntFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View PDF
                                </a>
                              ) : (
                                ""
                              )}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.paymentMode || ""}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.seniorApproval || ""}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.approvalAttachmentFile ? (
                                <a
                                  href={ticket.approvalAttachmentFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View PDF
                                </a>
                              ) : (
                                ""
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.followUpAttachment ? (
                                <a
                                  href={ticket.followUpAttachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
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
                            No invoice history found.
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
                                {ticket.ticketId || "N/A"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {ticket.clientName || "N/A"}
                              </p>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Quotation No.
                                </p>
                                <p className="text-blue-900">
                                  {ticket.quotationNo || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Phone
                                </p>
                                <p className="text-blue-900">
                                  {ticket.phoneNumber || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Category
                                </p>
                                <p className="text-blue-900">
                                  {ticket.invoiceCategory || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Company
                                </p>
                                <p className="text-blue-900">
                                  {ticket.companyName || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Invoice Numbers */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Invoice NABL
                                </p>
                                <p className="text-blue-900">
                                  {ticket.invoiceNoNABL || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Invoice SERVICE
                                </p>
                                <p className="text-blue-900">
                                  {ticket.invoiceNoSERVICE || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Invoice SPARE
                                </p>
                                <p className="text-blue-900">
                                  {ticket.invoiceNoSPARE || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Posted By
                                </p>
                                <p className="text-blue-900">
                                  {ticket.invoicePostedBy || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Amount Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  NABL Basic
                                </p>
                                <p className="text-blue-900">
                                  ₹{ticket.invoiceAmountNABLBasic || "0"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  NABL GST
                                </p>
                                <p className="text-blue-900">
                                  ₹{ticket.invoiceAmountNABLGst || "0"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Service Basic
                                </p>
                                <p className="text-blue-900">
                                  ₹{ticket.serviceAmountBasic || "0"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Spare Amount
                                </p>
                                <p className="text-blue-900">
                                  ₹{ticket.totalServiceAmtSpare || "0"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Basic Amount
                                </p>
                                <p className="text-blue-900">
                                  ₹{ticket.basicAmount || "0"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Total Amount
                                </p>
                                <p className="text-blue-900 font-semibold">
                                  ₹{ticket.totalAmountWithTex || "0"}
                                </p>
                              </div>
                            </div>

                            {/* Document Links */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Quotation
                                </p>
                                {ticket.quotationPdfLink ? (
                                  <a
                                    href={ticket.quotationPdfLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <p className="text-blue-900 text-xs">N/A</p>
                                )}
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Service Attach.
                                </p>
                                {ticket.attachmentService ? (
                                  <a
                                    href={ticket.attachmentService}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <p className="text-blue-900 text-xs">N/A</p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Spare Attach.
                                </p>
                                {ticket.attachmentSpear ? (
                                  <a
                                    href={ticket.attachmentSpear}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <p className="text-blue-900 text-xs">N/A</p>
                                )}
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  NABL Attach.
                                </p>
                                {ticket.attachmentNABL ? (
                                  <a
                                    href={ticket.attachmentNABL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <p className="text-blue-900 text-xs">N/A</p>
                                )}
                              </div>
                            </div>

                            {/* Bill Information */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Bill No.
                                </p>
                                <p className="text-blue-900">
                                  {ticket.billNo || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Bill File
                                </p>
                                {ticket.billFile ? (
                                  <a
                                    href={ticket.billFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <p className="text-blue-900 text-xs">N/A</p>
                                )}
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
      </Tabs>

      {/* Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Create Invoice"
        size="4xl"
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto"
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
            <Label>Quotation No.</Label>
            <Input
              value={formData.quotationNo || ""}
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
            <Label>Email Address</Label>
            <Input
              value={formData.emailAddress || ""}
              disabled
              className="bg-slate-50"
            />
          </div>
          <div>
            <Label>Company Name</Label>
            <Input
              value={formData.companyName || ""}
              disabled
              className="bg-slate-50"
            />
          </div>

          {!isCancelled && (
            <>
              {/* Editable fields */}
              <div>
                <Label>Invoice Posted By *</Label>
                {/* <Input
                  placeholder="Posted by"
                  value={formData.invoicePostedBy || ""}
                  onChange={(e) =>
                    handleInputChange("invoicePostedBy", e.target.value)
                  }
                  data-testid="input-posted-by"
                /> */}

                <Select
                  onValueChange={(value) =>
                    handleInputChange("invoicePostedBy", value)
                  }
                >
                  <SelectTrigger
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="select-person-name"
                  >
                    <SelectValue placeholder={formData.invoicePostedBy || ""} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                    <SelectItem
                      value={undefined}
                      className="hover:bg-blue-50 focus:bg-blue-50"
                    >
                      Posted By
                    </SelectItem>
                    {masterData.length > 0 && masterData[0]["Posted By"] ? (
                      masterData[0]["Posted By"].map((item, ind) => (
                        <SelectItem
                          key={ind}
                          value={item}
                          className="hover:bg-blue-50 focus:bg-blue-50"
                        >
                          {item}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="Loading" disabled>
                        Loading options...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Invoice No (NABL)</Label>
                <Input
                  placeholder="NABL invoice number"
                  value={formData.invoiceNoNABL || ""}
                  onChange={(e) =>
                    handleInputChange("invoiceNoNABL", e.target.value)
                  }
                  data-testid="input-nabl-invoice"
                />
              </div>
              <div>
                <Label>Invoice No (SERVICE)</Label>
                <Input
                  placeholder="Service invoice number"
                  value={formData.invoiceNoSERVICE || ""}
                  onChange={(e) =>
                    handleInputChange("invoiceNoSERVICE", e.target.value)
                  }
                  data-testid="input-service-invoice"
                />
              </div>
              <div>
                <Label>Invoice No (SPARE)</Label>
                <Input
                  placeholder="Spare invoice number"
                  value={formData.invoiceNoSPARE || ""}
                  onChange={(e) =>
                    handleInputChange("invoiceNoSPARE", e.target.value)
                  }
                  data-testid="input-spare-invoice"
                />
              </div>
              <div>
                <Label>Invoice Amount NABL (Basic)</Label>
                <Input
                  type="number"
                  placeholder="NABL basic amount"
                  value={formData.invoiceAmountNABLBasic || ""}
                  onChange={(e) =>
                    handleInputChange("invoiceAmountNABLBasic", e.target.value)
                  }
                  data-testid="input-nabl-basic"
                />
              </div>
              <div>
                <Label>Invoice Amount NABL (GST)</Label>
                <Input
                  type="number"
                  placeholder="NABL GST amount"
                  value={formData.invoiceAmountNABLGst || ""}
                  onChange={(e) =>
                    handleInputChange("invoiceAmountNABLGst", e.target.value)
                  }
                  data-testid="input-nabl-gst"
                />
              </div>
              <div>
                <Label>Invoice Amount SERVICE (Basic)</Label>
                <Input
                  type="number"
                  placeholder="Service basic amount"
                  value={formData.serviceAmountBasic || ""}
                  onChange={(e) =>
                    handleInputChange("serviceAmountBasic", e.target.value)
                  }
                  data-testid="input-service-basic"
                />
              </div>
              {/* new add */}
              <div>
                <Label>Invoice Amount SERVICE (gst)</Label>
                <Input
                  type="number"
                  placeholder="Service GST amount"
                  value={formData.serviceAmountGST || ""}
                  onChange={(e) =>
                    handleInputChange("serviceAmountGST", e.target.value)
                  }
                  data-testid="input-service-gst"
                />
              </div>

              <div>
                <Label>Invoice Amount SPARE (Basic)</Label>
                <Input
                  type="number"
                  placeholder="Spare amount"
                  value={formData.totalServiceAmtSpare || ""}
                  onChange={(e) =>
                    handleInputChange("totalServiceAmtSpare", e.target.value)
                  }
                  data-testid="input-spare-amount"
                />
              </div>

              {/* new add */}
              <div>
                <Label>Invoice Amount SPARE (gst)</Label>
                <Input
                  type="number"
                  placeholder="Total amount with GST"
                  value={formData.totalAmtWithGST || ""}
                  onChange={(e) =>
                    handleInputChange("totalAmtWithGST", e.target.value)
                  }
                  data-testid="input-total-gst"
                />
              </div>

              <div>
                <Label>ATTACHMENT (SERVICE )</Label>
                <Input
                  type="file"
                  onChange={(e) =>
                    handleInputChange(
                      "attachmentService",
                      e.target.files[0] || ""
                    )
                  }
                  data-testid="input-attachment-service"
                />
              </div>

              <div>
                <Label>ATTACHMENT (SPARE)</Label>
                <Input
                  type="file"
                  onChange={(e) =>
                    handleInputChange(
                      "attachmentSpear",
                      e.target.files[0] || ""
                    )
                  }
                  data-testid="input-attachment-spare"
                />
              </div>

              <div>
                <Label>ATTACHMENT (NABL)</Label>
                <Input
                  type="file"
                  onChange={(e) =>
                    handleInputChange("attachmentNABL", e.target.files[0] || "")
                  }
                  data-testid="input-attachment-nabl"
                />
              </div>

              {/* <div>
                <Label>SPARE INVOICE</Label>
                <Input
                  placeholder="Spare invoice details"
                  value={formData.spareInvoice || ""}
                  onChange={(e) =>
                    handleInputChange("spareInvoice", e.target.value)
                  }
                  data-testid="input-spare-invoice-details"
                />
              </div>
              <div>
                <Label>SERVICE INVOICE</Label>
                <Input
                  placeholder="Service invoice details"
                  value={formData.serviceInvoice || ""}
                  onChange={(e) =>
                    handleInputChange("serviceInvoice", e.target.value)
                  }
                  data-testid="input-service-invoice-details"
                />
              </div> */}

              {/* <div>
                <Label>NABL INVOICE</Label>
                <Input
                  placeholder="NABL invoice details"
                  value={formData.nablInvoice || ""}
                  onChange={(e) =>
                    handleInputChange("nablInvoice", e.target.value)
                  }
                  data-testid="input-nabl-invoice-details"
                />
              </div>
              <div>
                <Label>NON NABL</Label>
                <Input
                  placeholder="Non-NABL details"
                  value={formData.nonNabl || ""}
                  onChange={(e) => handleInputChange("nonNabl", e.target.value)}
                  data-testid="input-non-nabl"
                />
              </div>
              <div>
                <Label>Total Invoice Amt NON NABL BASIC</Label>
                <Input
                  type="number"
                  placeholder="Non-NABL basic amount"
                  value={formData.totalInvoiceAmtNonNABLBasic || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "totalInvoiceAmtNonNABLBasic",
                      e.target.value
                    )
                  }
                  data-testid="input-non-nabl-basic"
                />
              </div>
              <div>
                <Label>Total Invoice Amt NON NABL GST</Label>
                <Input
                  type="number"
                  placeholder="Non-NABL GST amount"
                  value={formData.totalInvoiceAmtNonNABLGst || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "totalInvoiceAmtNonNABLGst",
                      e.target.value
                    )
                  }
                  data-testid="input-non-nabl-gst"
                />
              </div>
              <div>
                <Label>Total Service Amt (spare) GST</Label>
                <Input
                  type="number"
                  placeholder="Spare GST amount"
                  value={formData.totalServiceAmtSpareGst || ""}
                  onChange={(e) =>
                    handleInputChange("totalServiceAmtSpareGst", e.target.value)
                  }
                  data-testid="input-spare-gst"
                />
              </div> */}

              <div className="md:col-span-2 flex space-x-4 pt-4">
                <Button
                  type="submit"
                  data-testid="button-submit-invoice"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
                >
                  {isSubmitting && <Loader2Icon className="animate-spin" />}
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInvoiceModal(false)}
                  data-testid="button-cancel-invoice"
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
