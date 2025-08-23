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
import { Loader2Icon, LoaderIcon } from "lucide-react";

export default function Conformation() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingTickets, setPendingTickets] = useState([]);
  const [historyTickets, setHistoryTickets] = useState([]);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchItem, setSearchItem] = useState("");
  const { toast } = useToast();

  // console.log("SelectedTicket",selectedTicket);

  const [masterData, setMasterData] = useState({});

  // console.log("masterData", masterData);

  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sheet_url =
    "https://script.google.com/macros/s/AKfycbxt4qSlLeddlVhPcM_ogBkdQzIIgtW8G1i9p2ClwhEkkceLYM29l8ceFA5Ijd1SxNj73g/exec";
  const Sheet_Id = "141vnE00frQTRx_bjHG2Zf0IslX5WUwe1Ho6UxJB1UVI";

  const fetchInvoiceSheet = async () => {
    setFetchLoading(true); // start loading
    try {
      const response = await fetch(`${sheet_url}?sheet=Invoice`);
      const json = await response.json();

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

          planned13: row[31],
          actual13: row[32],
          delay13: row[33],
          otp: row[34],
          otpVarification: row[35],

          planned14: row[36],
          actual14: row[37],
          delay14: row[38],

          planned15: row[39],
          actual15: row[40],
          delay15: row[41],
          calibrationDate: row[42],
          calibrationPeriodMonth: row[43],
          calibrationUploadFile: row[44],

          planned16: row[45],
          actual16: row[46],
          delay16: row[47],
          accountablityApproval: row[48],
          screenShort: row[49],
          senderName: row[50],


          planned17: row[51],
          actual17: row[52],
          delay17: row[53],
          courierReceivedByClient: row[54],
          numberOfCertificatesDocuments: row[55],
          fullDestinationAddress: row[56],
          dateOfDispatch: row[57],
          courierCompanyName: row[58],
          courierTrackingNumber: row[59],
          expectedDeliveryDate: row[60],
          calibrationCertificateAttachment: row[61],


          planned18: row[62],
          actual18: row[63],
          delay18: row[64],
          courierReceiveByClient: row[65],
          personName: row[66],
        }));

        // Filter data based on your conditions

        // console.log("Alldata", allData);

        const pending = allData.filter(
          (item) => item.planned18 !== "" && item.actual18 === ""
        );

        const history = allData.filter(
          (item) => item.planned18 !== "" && item.actual18 !== ""
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
    fetchInvoiceSheet();
  }, []);

  useEffect(() => {
    const tickets = storage.getTickets();
    const pending = tickets.filter((t) => t.status === "warehouse-completed");
    const history = tickets.filter((t) => t.status === "completed");

    setPendingTickets(pending);
    setHistoryTickets(history);
  }, []);

  const handleCalibrationClick = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      ticketId: ticket.ticketId,
      quotationNo: ticket.quotationNo || `QT-${ticket.id}`,
      clientName: ticket.clientName,
      phoneNumber: ticket.phoneNumber,
      companyName: ticket.companyName || "",
      quotationPdfLink: ticket.quotationPdfLink || "",
      entryNo: ticket.entryNo || "",
      calibrationCertificatePlanDate: "",
      personName: "",
      calibrationDate: "",
      calibrationUpload: "",
      calibrationDueDate: "",
      courierReceivedByClient: "",
      numberOfCertificatesDocuments: "",
      dateOfDispatch: "",
      courierCompanyName: "",
      courierTrackingNumber: "",
      fullDestinationAddress: "",
      expectedDeliveryDate: "",
      attachment: "",
    });
    setShowCalibrationModal(true);
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
          folderId: "1lxOxL-OK3kUrYan8T6LVkIBbElLAEKxk",
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

    // if (!formData.clientName || !formData.phoneNumber || !formData.title) {
    //   toast({
    //     title: "Error",
    //     description: "Please fill in all required fields",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setIsSubmitting(true);

    let calibrationfileUrls = "";

    // Handle all file uploads

    if (formData.calibrationUpload) {
      const uploadResult = await uploadImageToDrive(formData.calibrationUpload);
      if (!uploadResult.success) {
        throw new Error(
          uploadResult.error || "Failed to upload calibration copy"
        );
      }
      calibrationfileUrls = uploadResult.fileUrl;
    }


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
          sheetName: "Invoice",
          action: "update",
          rowIndex: (id + 6).toString(),
          columnData: JSON.stringify({
            BL: currentDateTime,
            BN: formData.courierReceivedByClient || "",
            BO: formData.personName || "",
          }),
        }).toString(),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update Google Sheet");
      }

      if (result.success) {
        setPendingData((prev) =>
          prev.filter((t) => t.ticketId !== selectedTicket.ticketId)
        );

        // Add to historyData with the new calibration data
        setHistoryData((prev) => [
          {
            ...selectedTicket,
            calibrationCertificatePlanDate:
              formData.calibrationCertificatePlanDate,
            personName: formData.personName,
            calibrationDate: formData.calibrationDate,
            calibrationUpload:
              calibrationfileUrls || "",
            calibrationDueDate: formData.calibrationDueDate,
           
           
            courierReceivedByClient: formData.courierReceivedByClient,
            numberOfCertificates: formData.numberOfCertificatesDocuments,
            dateOfDispatch: formData.dateOfDispatch,
            courierCompanyName: formData.courierCompanyName,
            courierTrackingNumber: formData.courierTrackingNumber,
            fullDestinationAddress: formData.fullDestinationAddress,
            expectedDeliveryDate: formData.expectedDeliveryDate,
           
          },
          ...prev,
        ]);

        setShowCalibrationModal(false);
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
      setShowCalibrationModal(false);
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
        item.clientName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.companyName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase());
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
        item.clientName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.companyName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase());
      // const matchesParty =
      //   filterParty === "all" || item.partyName === filterParty;
      // return matchesSearch && matchesParty;
      return matchesSearch;
    })
    .reverse();

  // console.log("filteredPendingData", filteredPendingData);
  // console.log("filteredHistoryData", filteredHistoryData);

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
                Search (Client, Company, Phone)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="searchFilter"
                  placeholder="Search by client, company or phone..."
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
              <CardTitle className="text-blue-800">
                Pending Calibrations
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
                          Quotation No.
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Phone Number
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Email Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Category
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Company Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation Pdf link
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Calibration Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Calibration Period (MONTH)
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Calibration Upload
                        </th>


                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Accountablity & Approval
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Screen Short
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Sender Name
                        </th>


                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Certificate Type/Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Number of Certificates/Documents
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Full Destination Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Date of Dispatch
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Courier Company Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Courier Tracking Number
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Expected Delivery Date
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
                            colSpan={15}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-pending"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No pending calibrations found.
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
                                onClick={() => handleCalibrationClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 hover:from-indigo-100 hover:to-blue-100 hover:text-indigo-700 transition-all duration-300 border border-indigo-200 hover:border-indigo-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md group"
                                data-testid={`button-calibration-${ticket.ticketId}`}
                              >
                                <span className="font-medium">Calibration</span>
                              </Button>
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {ticket.ticketId}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.quotationNo || `QT-${ticket.id}`}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.phoneNumber}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.emailAddress}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.invoiceCategory}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.companyName || "N/A"}
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
                                "N/A"
                              )}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.calibrationDate) || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.calibrationPeriodMonth || "N/A"}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.calibrationUploadFile ? (
                                <a
                                  href={ticket.calibrationUploadFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View PDF
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.accountablityApproval || "N/A"}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.screenShort ? (
                                <a
                                  href={ticket.screenShort}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View PDF
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.senderName || "N/A"}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.certificateTypeName || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.numberOfCertificatesDocuments || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.fullDestinationAddress || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.dateOfDispatch) || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.courierCompanyName || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.courierTrackingNumber || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.expectedDeliveryDate) || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {ticket.calibrationCertificateAttachment ? (
                                <a
                                  href={ticket.calibrationCertificateAttachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View
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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Calibration History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
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
                          Email Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Category
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Company Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation Pdf link
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Calibration Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Calibration Period (MONTH)
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Calibration Upload
                        </th>


                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Accountablity & Approval
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Screen Short
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Sender Name
                        </th>


                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Certificate Type/Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Number of Certificates/Documents
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Full Destination Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Date of Dispatch
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Courier Company Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Courier Tracking Number
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Expected Delivery Date
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
                            colSpan={26}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-history"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No calibration history found.
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
                              {ticket.quotationNo || `QT-${ticket.id}`}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.phoneNumber}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.emailAddress}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.invoiceCategory}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.companyName || "N/A"}
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
                                "N/A"
                              )}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.calibrationDate) || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.calibrationPeriodMonth || "N/A"}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.calibrationUploadFile ? (
                                <a
                                  href={ticket.calibrationUploadFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View PDF
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.accountablityApproval || "N/A"}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.screenShort ? (
                                <a
                                  href={ticket.screenShort}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View PDF
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.senderName || "N/A"}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.certificateTypeName || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.numberOfCertificatesDocuments || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.fullDestinationAddress || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.dateOfDispatch) || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.courierCompanyName || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.courierTrackingNumber || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.expectedDeliveryDate) || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {ticket.calibrationCertificateAttachment ? (
                                <a
                                  href={ticket.calibrationCertificateAttachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                >
                                  View
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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Calibration Modal */}
      <Modal
        isOpen={showCalibrationModal}
        onClose={() => setShowCalibrationModal(false)}
        title="Calibration Details"
        size="4xl"
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto p-2"
        >
          {/* Pre-filled fields */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Ticket ID
            </Label>
            <Input
              value={formData.ticketId || ""}
              disabled
              className="bg-gray-100 text-gray-800 border-gray-300"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Quotation No.
            </Label>
            <Input
              value={formData.quotationNo || ""}
              disabled
              className="bg-gray-100 text-gray-800 border-gray-300"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Client Name
            </Label>
            <Input
              value={formData.clientName || ""}
              disabled
              className="bg-gray-100 text-gray-800 border-gray-300"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <Input
              value={formData.phoneNumber || ""}
              disabled
              className="bg-gray-100 text-gray-800 border-gray-300"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Company Name
            </Label>
            <Input
              value={formData.companyName || ""}
              disabled
              className="bg-gray-100 text-gray-800 border-gray-300"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Entry No.
            </Label>
            <Input
              value={formData.entryNo || ""}
              disabled
              className="bg-gray-100 text-gray-800 border-gray-300"
            />
          </div>

          {/* Editable fields
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Calibration Certificate Plan Date{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.calibrationCertificatePlanDate || ""}
              onChange={(e) =>
                handleInputChange(
                  "calibrationCertificatePlanDate",
                  e.target.value
                )
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-plan-date"
            />
          </div> */}

          


          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Courier Received By Client 
            </Label>
            <Input
              placeholder="Enter certificate type"
              value={formData.courierReceivedByClient || ""}
              onChange={(e) =>
                handleInputChange("courierReceivedByClient", e.target.value)
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-certificate-type"
            />
          </div>


          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
               Person Name{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                handleInputChange("personName", value)
              }
            >
              <SelectTrigger
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                data-testid="select-person-name"
              >
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                {masterData.length > 0 && masterData[0]["Name(Drop-Down)"] ? (
                  masterData[0]["Name(Drop-Down)"].map((item, ind) => (
                    <SelectItem
                      key={ind}
                      value={item}
                      className="hover:bg-blue-50 focus:bg-blue-50"
                    >
                      {item}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Loading options...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Calibration Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.calibrationDate || ""}
              onChange={(e) =>
                handleInputChange("calibrationDate", e.target.value)
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-calibration-date"
            />
          </div> */}

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Calibration Upload
            </Label>
            <div className="relative">
              <Input
                type="file"
                onChange={(e) =>
                  handleInputChange(
                    "calibrationUpload",
                    e.target.files[0] || ""
                  )
                }
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                data-testid="input-calibration-copy"
              />
            </div>
          </div> */}

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Calibration Certificate Required
            </Label>
            <div className="relative">
              <Input
                type="file"
                onChange={(e) =>
                  handleInputChange(
                    "calibrationCertificateRequired",
                    e.target.files[0] || ""
                  )
                }
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                data-testid="input-calibration-certificate-required"
              />
            </div>
          </div> */}

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Soft Copy Shared With
            </Label>
            <div className="relative">
              <Input
                type="file"
                onChange={(e) =>
                  handleInputChange(
                    "softCopySharedwith",
                    e.target.files[0] || ""
                  )
                }
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                data-testid="input-soft-copy"
              />
            </div>
          </div> */}

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Calibration Due Date
            </Label>
            <Input
              type="date"
              value={formData.calibrationDueDate || ""}
              onChange={(e) =>
                handleInputChange("calibrationDueDate", e.target.value)
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-due-date"
            />
          </div> */}

          

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Number of Certificates/Documents
            </Label>
            <Input
              type="number"
              placeholder="Enter number"
              value={formData.numberOfCertificatesDocuments || ""}
              onChange={(e) =>
                handleInputChange(
                  "numberOfCertificatesDocuments",
                  e.target.value
                )
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-certificate-count"
            />
          </div> */}

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Calibration Period (MONTH)
            </Label>
            <Input
              type="number"
              placeholder="Enter number"
              value={formData.calibrationPeriodMonth || ""}
              onChange={(e) =>
                handleInputChange("calibrationPeriodMonth", e.target.value)
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-calibration-period-month"
            />
          </div> */}

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Date of Dispatch
            </Label>
            <Input
              type="date"
              value={formData.dateOfDispatch || ""}
              onChange={(e) =>
                handleInputChange("dateOfDispatch", e.target.value)
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-dispatch-date"
            />
          </div> */}
          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Courier Company Name
            </Label>
            <Input
              placeholder="Enter courier company"
              value={formData.courierCompanyName || ""}
              onChange={(e) =>
                handleInputChange("courierCompanyName", e.target.value)
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-courier-company"
            />
          </div> */}

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Courier Tracking Number
            </Label>
            <Input
              placeholder="Enter tracking number"
              value={formData.courierTrackingNumber || ""}
              onChange={(e) =>
                handleInputChange("courierTrackingNumber", e.target.value)
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-tracking-number"
            />
          </div> */}

          {/* <div className="md:col-span-2 space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Full Destination Address
            </Label>
            <Input
              placeholder="Enter full address"
              value={formData.fullDestinationAddress || ""}
              onChange={(e) =>
                handleInputChange("fullDestinationAddress", e.target.value)
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-destination-address"
            />
          </div> */}

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Expected Delivery Date
            </Label>
            <Input
              type="date"
              value={formData.expectedDeliveryDate || ""}
              onChange={(e) =>
                handleInputChange("expectedDeliveryDate", e.target.value)
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-delivery-date"
            />
          </div> */}

          {/* <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Attachment
            </Label>
            <div className="relative">
              <Input
                type="file"
                onChange={(e) =>
                  handleInputChange("attachment", e.target.files[0] || "")
                }
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                data-testid="input-attachment"
              />
            </div>
          </div> */}

          <div className="md:col-span-2 flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCalibrationModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              data-testid="button-cancel-calibration"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-submit-calibration"
            >
              {isSubmitting ? (
                <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
              ) : null}
              Submit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
