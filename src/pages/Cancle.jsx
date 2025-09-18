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
import { Textarea } from "../components/ui/textarea";

export default function Cancle() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingTickets, setPendingTickets] = useState([]);
  const [historyTickets, setHistoryTickets] = useState([]);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchItem, setSearchItem] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelSheetData, setCancelSheetData] = useState([]);
  const { toast } = useToast();

  // console.log("SelectedTicket",selectedTicket);

  const [masterData, setMasterData] = useState({});

  // console.log("masterData", masterData);

  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sheet_url =
    "https://script.google.com/macros/s/AKfycbzsDuvTz21Qx8fAP3MthQdRanIKnFFScPf-SRYp40CqYfKmO4CImMH7-_cVQjMqCsBD/exec";
  const Sheet_Id = "1teE4IIdCw7qnQvm_W7xAPgmGgpU13dtYw6y5ui01HHc";

  const fetchCancleSheet = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${sheet_url}?sheet=Follow-Up`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const headers = result.data[0]; // First row contains headers
        const formattedData = result.data.slice(1).map((row) => {
          const obj = {};
          headers.forEach((header, index) => {
            // Convert header to camelCase or another JS-friendly format if needed
            const key = header.toLowerCase().replace(/\s+/g, "_");
            obj[key] = row[index] || null; // Handle empty cells
          });
          return obj;
        });

        // console.log("Formatted data:", formattedData);
        setCancelSheetData(formattedData);
      } else {
        console.log("No data available");
        return [];
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
      toast.error("Failed to load master data");
      throw error; // Re-throw if you want calling code to handle it
    } finally{
      setFetchLoading(false);
    }
  };

  // const fetchMasterSheet = async () => {
  //   try {
  //     const response = await fetch(`${sheet_url}?sheet=Master`);
  //     const result = await response.json();

  //     if (result.success && result.data && result.data.length > 0) {
  //       const headers = result.data[0]; // First row contains headers
  //       const structuredData = {};

  //       // Initialize each header with an empty array
  //       headers.forEach((header) => {
  //         structuredData[header] = [];
  //       });

  //       // Process each data row (skip the header row)
  //       result.data.slice(1).forEach((row) => {
  //         row.forEach((value, index) => {
  //           const header = headers[index];
  //           // Handle cases where value might be null/undefined or not a string
  //           if (value !== null && value !== undefined) {
  //             const stringValue = String(value).trim(); // Convert to string and trim
  //             if (stringValue !== "") {
  //               structuredData[header].push(stringValue);
  //             }
  //           }
  //         });
  //       });

  //       // Remove duplicates from each array
  //       Object.keys(structuredData).forEach((key) => {
  //         structuredData[key] = [...new Set(structuredData[key])];
  //       });

  //       // console.log("Structured Master Data:", structuredData);
  //       setMasterData([structuredData]); // Wrap in array as per your requested format
  //     }
  //   } catch (error) {
  //     console.error("Error fetching master data:", error);
  //     toast.error("Failed to load master data");
  //   }
  // };

  useEffect(() => {
    // fetchMasterSheet();
    fetchCancleSheet();
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
            BO: currentDateTime,
            BQ: formData.courierReceivedByClient || "",
            BR: formData.personName || "",
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
            calibrationUpload: calibrationfileUrls || "",
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
        selectedTicket.invoiceCategory || "", // Bill Number Input

        selectedTicket.title || "", // Machine Name
        selectedTicket.description || "", // Machine Name
        "Conformation", // Enquiry Type (second one)
        formData.cancelRemarks || ""
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
        setShowCalibrationModal(false);
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

  // const filteredPendingData = cancelSheetData
  //   .filter((item) => {
  //     // const phoneNumberStr = String(item.phoneNumber || "");
  //     const matchesSearch =
  //       item.clientName?.toLowerCase().includes(searchItem.toLowerCase()) ||
  //       item.companyName?.toLowerCase().includes(searchItem.toLowerCase()) ||
  //       phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase());
  //     // const matchesParty =
  //     //   filterParty === "all" || item.partyName === filterParty;
  //     // return matchesSearch && matchesParty;
  //     return matchesSearch;
  //   })
  //   .reverse();

  // const filteredHistoryData = historyData
  //   .filter((item) => {
  //     const phoneNumberStr = String(item.phoneNumber || "");
  //     const matchesSearch =
  //       item.clientName?.toLowerCase().includes(searchItem.toLowerCase()) ||
  //       item.companyName?.toLowerCase().includes(searchItem.toLowerCase()) ||
  //       phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase());
  //     // const matchesParty =
  //     //   filterParty === "all" || item.partyName === filterParty;
  //     // return matchesSearch && matchesParty;
  //     return matchesSearch;
  //   })
  //   .reverse();

  // console.log("filteredPendingData", filteredPendingData);
  console.log("cancelSheetData", cancelSheetData);

  return (
    <div className="space-y-6">
      {/* Filter Options */}
      {/* <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
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
      </Card> */}

      {/* Tabs */}

       <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <TabsTrigger
            value="pending"
            data-testid="tab-pending"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Cancel ({cancelSheetData.length})
          </TabsTrigger>
          {/* <TabsTrigger
            value="history"
            data-testid="tab-history"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            History ({filteredHistoryData.length})
          </TabsTrigger> */}
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
                          Ticket ID
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Stage
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
                          What Did The Customer Say
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Next Action
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Next Date Of Call
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Attachment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {cancelSheetData.length === 0 ? (
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
                        cancelSheetData.map((ticket, ind) => (
                          <tr
                            key={ind}
                            className={
                              ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                            }
                          >
                            
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {ticket.ticket_id}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.stage}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.payment_term_}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.acceptance_via}
                            </td>


                            <td className="px-4 py-3">
                              {ticket.acceptance_attachments_ ? (
                                <a
                                  href={ticket.acceptance_attachments_}
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


                            <td className="px-4 py-3 text-blue-900">
                              {ticket.payment_mode}
                            </td>


                            <td className="px-4 py-3 text-blue-900">
                              {ticket.senior_approval}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.approval_attachment ? (
                                <a
                                  href={ticket.approval_attachment}
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
                            
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.what_did_the_customer_say) || "N/A"}
                            </td>


                            <td className="px-4 py-3 text-blue-900">
                              {ticket.next_action || "N/A"}
                            </td>


                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.next_date_of_call) || "N/A"}
                            </td>

                            <td className="px-4 py-3">
                              {ticket.attachment ? (
                                <a
                                  href={ticket.attachment}
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

        {/* <TabsContent value="history">
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
        </TabsContent> */}
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

          {!isCancelled && (
            <>
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
                  Person Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter Person Name"
                  value={formData.personName || ""}
                  onChange={(e) =>
                    handleInputChange("personName", e.target.value)
                  }
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="input-destination-address"
                />
              </div>

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
