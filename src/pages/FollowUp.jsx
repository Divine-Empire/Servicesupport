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
import { Textarea } from "../components/ui/textarea";
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

export default function FollowUp() {
  const [activeTab, setActiveTab] = useState("pending");
  const [dateFilterTab, setDateFilterTab] = useState("");

  const [pendingTickets, setPendingTickets] = useState([]);
  const [historyTickets, setHistoryTickets] = useState([]);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({});
  const [followUpData, setFollowUpData] = useState([]);
  const [searchItem, setSearchItem] = useState("");

  const { toast } = useToast();

  const [masterData, setMasterData] = useState({});

  // console.log("followUpData", followUpData);

  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

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
          quotationNo: row[40], // <-- THIS IS COLUMN AO
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
          CREName: row[127],

          // Last Date Of Call	Status	Stage	What Did The Customer Say	Next Action	Next Date Of Call	Payment term	Against Delivery	Acceptance Via	Acceptance file	Payment  Terms	Payment Mode	Advance attachment 	Senior Approval
        }));

        // Filter data based on your conditions

        const pending = allData.filter(
          (item) => item.planned4 !== "" && item.actual4 === ""
        );
        // console.log("pending", pending);

        const history = allData.filter(
          (item) => item.planned4 !== "" && item.actual4 !== ""
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

  const fetchFllowUpSheet = async () => {
    try {
      const response = await fetch(`${sheet_url}?sheet=Follow-Up`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const headers = result.data[0]; // First row contains headers
        const formattedData = result.data.slice(1).map((row) => {
          const obj = {};
          headers.forEach((header, index) => {
            // Convert header to camelCase or another JS-friendly format if needed
            const key = header
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace("no.", "no"); // Handle "No." case
            obj[key] = row[index] || null; // Handle empty cells
          });
          return obj;
        });

        // console.log("Formatted data:", formattedData);
        setFollowUpData(formattedData);
      } else {
        // console.log("No data available");
        return [];
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
      toast.error("Failed to load master data");
      throw error; // Re-throw if you want calling code to handle it
    }
  };

  useEffect(() => {
    fetchMasterSheet();
    fetchData();
    fetchFllowUpSheet();
  }, []);

  useEffect(() => {
    const tickets = storage.getTickets();
    const pending = tickets.filter((t) => t.status === "quotation-completed");
    const history = tickets.filter((t) => t.status === "follow-up-completed");

    setPendingTickets(pending);
    setHistoryTickets(history);
  }, []);

  const handleFollowUpClick = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      ticketId: ticket.ticketId,
      clientName: ticket.clientName,
      phoneNumber: ticket.phoneNumber,
      quotationNo: ticket.quotationNo || "", // <-- NEW: Prefill Quotation No
      enquiryReceiverName: ticket.enquiryReceiverName || "",
      warrantyCheck: ticket.warrantyCheck || "",
      machineName: ticket.machineName || "",
      enquiryType: ticket.enquiryType || "",
      engineerAssign: ticket.engineerAssign || "",
      siteName: ticket.siteName || "",
      basicAmount: ticket.basicAmount || "",
      totalAmountWithTax: ticket.totalAmountWithTax || "",
      quotationPdfLink: ticket.quotationPdfLink || "",
      quotationShareBy: ticket.quotationShareBy || "",
      shareThrough: ticket.shareThrough || "",
      remarks: ticket.remarks || "",
      lastDateOfCall: "",
      status: "",
      stage: "",
      whatDidCustomerSay: "",
      nextAction: "",
      nextDateOfCall: "",
      paymentTerm: "",
      againstDelivery: "",
      acceptanceVia: "",
      paymentMode: "",
      advanceAttachment: "",
      seniorApproval: "",
    });
    setShowFollowUpModal(true);
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
    //  toast({
    //    title: "Error",
    //    description: "Please fill in all required fields",
    //    variant: "destructive",
    //  });
    //  return;
    // }

    if (formData.stage === "Followup") {
      if (!formData.whatDidCustomerSay) {
        alert("Please Write Something in What did Customer Say");
        return;
      }

      if (!formData.nextAction) {
        alert("Please Write Something in Next Action");
        return;
      }
      if (!formData.nextDateOfCall) {
        alert("Please Select Next Date of Call");
        return;
      }
    } else {
      if (!formData.approvalAttachmentFile) {
        alert("Please add file for client Attachment");
        return;
      }
      if (!formData.acceptanceAttachemntFile) {
        alert("Please add file for Senior Attachment");
        return;
      }
      if (!formData.paymentTerm) {
        alert("Please select Payment Term");
        return;
      }
      if (!formData.acceptanceVia) {
        alert("Please select acceptance Via");
        return;
      }
      if (!formData.paymentMode) {
        alert("Please select Payment Mode");
        return;
      } else {
        if (formData.paymentMode !== "FullyAdvance") {
          if (!formData.seniorApproval) {
            alert("Please select Senior Approval");
            return;
          }
        }
      }

      if (
        formData.paymentMode === "FullyAdvance" ||
        formData.paymentMode === "Partial Advance" ||
        formData.paymentMode === "Partial Advance+PDC" ||
        formData.paymentMode === "Current Date Cheque"
      ) {
        if (!formData.followupremarkFile) {
          alert("please add file for Advance Payment Attachment");
          return;
        }
      }
    }

    setIsSubmitting(true);
    let acceptanceFile = "";
    let approvalFile = "";

    let followupremarkFileUrl = "";

    if (formData.followupremarkFile) {
      const uploadResult = await uploadImageToDrive(
        formData.followupremarkFile
      );
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }
      followupremarkFileUrl = uploadResult.fileUrl;
      // console.log("acceptanceFile", acceptanceFile);
    }

    if (formData.acceptanceAttachemntFile) {
      const uploadResult = await uploadImageToDrive(
        formData.acceptanceAttachemntFile
      );
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }
      acceptanceFile = uploadResult.fileUrl;
      // console.log("acceptanceFile", acceptanceFile);
    }

    if (formData.approvalAttachmentFile) {
      const uploadResult = await uploadImageToDrive(
        formData.approvalAttachmentFile
      );
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }
      approvalFile = uploadResult.fileUrl;
      // console.log("approvalFile", approvalFile);
    }

    const currentDateTime = formatDateTime(new Date());

    try {
      const rowData = [
        currentDateTime, // A
        formData.ticketId || "", // B
        formData.stage || "", // C
        formData.paymentTerm || "", // D
        formData.acceptanceVia || "", // E
        acceptanceFile || "", // F
        formData.paymentMode || "", // G
        formData.seniorApproval || "", // H
        approvalFile || "", // I
        formData.whatDidCustomerSay || "", // J
        formData.nextAction || "", // K
        formData.nextDateOfCall || "", // L
        followupremarkFileUrl || "", // M
        formData.quotationNo || "", // N <-- NEW: Save Quotation No
      ];

      // console.log("rowDAta", formData);

      const response = await fetch(sheet_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          sheetName: "Follow-Up",
          action: "insert",
          rowData: JSON.stringify(rowData),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // setTickets([...tickets, newTicket]);
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
        setShowFollowUpModal(false);

        // Update local state immediately
        setPendingData((prevPending) =>
          prevPending.filter(
            (ticket) => ticket.ticketId !== selectedTicket.ticketId
          )
        );
        setFollowUpData((prevHistory) => [
          {
            timestamp: currentDateTime, // Add timestamp
            ticket_id: formData.ticketId,
            quotation_no: formData.quotationNo, // <-- NEW: Add to local state
            stage: formData.stage,
            what_did_the_customer_say: formData.whatDidCustomerSay,
            next_action: formData.nextAction,
            next_date_of_call: formData.nextDateOfCall,
            payment_term: formData.paymentTerm,
            acceptance_via: formData.acceptanceVia,
            acceptance_attachment: acceptanceFile || "", // Add acceptance attachment
            payment_mode: formData.paymentMode,
            senior_approval: formData.seniorApproval,
            approval_attachment: approvalFile || "", // Add approval attachment
            remarks: followupremarkFileUrl || "", // Add remarks
          },
          ...prevHistory,
        ]);

        toast({
          title: "Success",
          description: "follow-up added successfully",
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
      setIsSubmitting(false);
      // setShowForm(false);
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
        "Follow-Up", // Enquiry Type (second one)
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
        setShowFollowUpModal(false);
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
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const renderConditionalFields = () => {
    const stage = formData.stage;

    if (
      // stage === "call-not-picked" ||
      stage === "Followup"
      // stage === "introductory-call"
    ) {
      return (
        <>
          <div>
            <Label>What Did The Customer Say *</Label>
            <Textarea
              rows={3}
              value={formData.whatDidCustomerSay || ""}
              onChange={(e) =>
                handleInputChange("whatDidCustomerSay", e.target.value)
              }
              data-testid="textarea-customer-say"
            />
          </div>
          <div>
            <Label>Next Action *</Label>
            <Input
              value={formData.nextAction || ""}
              onChange={(e) => handleInputChange("nextAction", e.target.value)}
              data-testid="input-next-action"
            />
          </div>
          <div>
            <Label>Next Date Of Call *</Label>
            <Input
              type="date"
              value={formData.nextDateOfCall || ""}
              onChange={(e) =>
                handleInputChange("nextDateOfCall", e.target.value)
              }
              data-testid="input-next-date"
            />
          </div>
        </>
      );
    } else if (stage === "Order Received") {
      return (
        <>
          {/* Editable fields */}
          <div>
            <Label>Client Attachments *</Label>
            <Input
              type="file"
              placeholder="Client Attachments"
              onChange={(e) =>
                handleInputChange("approvalAttachmentFile", e.target.files[0])
              }
              data-testid="approval-attachments"
            />
          </div>

          <div>
            <Label>Senior Attachments *</Label>
            <Input
              type="file"
              placeholder="Senior Attachments"
              onChange={(e) =>
                handleInputChange("acceptanceAttachemntFile", e.target.files[0])
              }
              data-testid="acceptance-attachments"
            />
          </div>

          <div>
            <Label>Payment Term *</Label>
            <Select
              value={formData.paymentTerm || undefined} // Use undefined instead of empty string
              onValueChange={(value) => handleInputChange("paymentTerm", value)}
            >
              <SelectTrigger data-testid="Payment Terms">
                <SelectValue placeholder="Payment Term" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                {masterData.length > 0 && masterData[0]["Payment Terms"] ? (
                  masterData[0]["Payment Terms"].map(
                    (item, ind) =>
                      item && ( // Only render if item is not empty
                        <SelectItem
                          key={ind}
                          value={item}
                          className="hover:bg-blue-50 focus:bg-blue-50"
                        >
                          {item}
                        </SelectItem>
                      )
                  )
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading options...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Acceptance Via with Mail fix */}

          <div>
            <Label>Acceptance Via *</Label>
            <Select
              value={formData.acceptanceVia || undefined} // Use undefined instead of empty string
              onValueChange={(value) =>
                handleInputChange("acceptanceVia", value)
              }
            >
              <SelectTrigger data-testid="acceptance Via">
                <SelectValue placeholder="Acceptance Via" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                <SelectItem
                  value="Mail"
                  className="hover:bg-blue-50 focus:bg-blue-50"
                >
                  Mail
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Payment Mode *</Label>
            <Select
              value={formData.paymentMode || undefined} // Use undefined instead of empty string
              onValueChange={(value) => handleInputChange("paymentMode", value)}
            >
              <SelectTrigger data-testid="select-payment-mode">
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                {masterData.length > 0 && masterData[0]["Payment Mode"] ? (
                  masterData[0]["Payment Mode"].map(
                    (item, ind) =>
                      item && ( // Only render if item is not empty
                        <SelectItem
                          key={ind}
                          value={item}
                          className="hover:bg-blue-50 focus:bg-blue-50"
                        >
                          {item}
                        </SelectItem>
                      )
                  )
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading options...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {formData.paymentMode !== "" &&
            (formData.paymentMode === "FullyAdvance" ||
              formData.paymentMode === "Partial Advance" ||
              formData.paymentMode === "Partial Advance+PDC" ||
              formData.paymentMode === "Current Date Cheque") && (
              <div>
                <Label>Advance Payment Attachment *</Label>
                <Input
                  type="file"
                  placeholder="Advance Payment"
                  onChange={(e) =>
                    handleInputChange("followupremarkFile", e.target.files[0])
                  }
                  data-testid="attachment"
                />
              </div>
            )}

          {formData.paymentMode !== "" &&
            formData.paymentMode !== "FullyAdvance" && (
              <div>
                <Label>Senior Approval *</Label>
                <Select
                  value={formData.seniorApproval || undefined} // Use undefined instead of empty string
                  onValueChange={(value) =>
                    handleInputChange("seniorApproval", value)
                  }
                >
                  <SelectTrigger data-testid="select-senior-approval">
                    <SelectValue placeholder="Select approval status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                    {masterData.length > 0 &&
                    masterData[0]["Senior Approval"] ? (
                      masterData[0]["Senior Approval"].map(
                        (item, ind) =>
                          item && ( // Only render if item is not empty
                            <SelectItem
                              key={ind}
                              value={item}
                              className="hover:bg-blue-50 focus:bg-blue-50"
                            >
                              {item}
                            </SelectItem>
                          )
                      )
                    ) : (
                      <SelectItem value="loading" disabled>
                        Loading options...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
        </>
      );
    }
    return null;
  };

  const filteredPendingData = pendingData
    .filter((item) => {
      const phoneNumberStr = String(item.phoneNumber || "");
      const quotationNoStr = String(item.quotationNo || "");
      const matchesSearch =
        item.ticketId?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.companyName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase()) ||
        quotationNoStr?.toLowerCase().includes(searchItem.toLowerCase());
      return matchesSearch;
    })
    .reverse();

  const filteredHistoryData = followUpData
    .filter((item) => {
      const phoneNumberStr = String(item.phone_number || "");
      const quotationNoStr = String(item.quotation_no || "");
      const matchesSearch =
        item.ticket_id?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.client_name?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.company_name?.toLowerCase().includes(searchItem.toLowerCase()) ||
        phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase()) ||
        quotationNoStr?.toLowerCase().includes(searchItem.toLowerCase());
      return matchesSearch;
    })
    .reverse();

  const filterByDateCategory = (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data.filter((item) => {
      const nextDate = new Date(item.nextDateOfCall);
      nextDate.setHours(0, 0, 0, 0);

      if (dateFilterTab === "today") {
        return nextDate.getTime() === today.getTime();
      } else if (dateFilterTab === "upcoming") {
        return nextDate.getTime() > today.getTime();
      } else if (dateFilterTab === "overdue") {
        return nextDate.getTime() < today.getTime();
      }
      return true;
    });
  };

  const finalFilteredPendingDataa = filterByDateCategory(filteredPendingData);
  const finalFilteredHistoryDataa = filterByDateCategory(filteredHistoryData);



    const userName = localStorage.getItem("currentUsername");

      const roleStorage = localStorage.getItem("o2d-auth-storage");
  const parsedData = JSON.parse(roleStorage);
  const role = parsedData.state.user.role;

  const finalFilteredPendingData = role === "user" ? finalFilteredPendingDataa.filter(
    (item) => item["CREName"] === userName
  ) : finalFilteredPendingDataa;

  const finalFilteredHistoryData = role=== "user" ?  finalFilteredHistoryDataa.filter(
    (item) => item["cre_name"] === userName
  ) : finalFilteredHistoryDataa;

  // console.log("finalFilteredPendingDataa", finalFilteredPendingDataa);
  // console.log("finalFilteredHistoryDataa", finalFilteredHistoryDataa);


  return (
    <div className="space-y-2">
      {/* Filter Options */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="2">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full">
              <Label
                htmlFor="searchFilter"
                className="text-sm font-medium text-blue-700"
              >
                {/* UPDATED SEARCH LABEL */}
                Search (Ticket ID, Client, Company, Phone, Quotation No)
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
        <div className="sm:flex justify-between">
          <TabsList className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <TabsTrigger
              value="pending"
              data-testid="tab-pending"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Pending ({finalFilteredPendingData.length})
            </TabsTrigger>
            <TabsTrigger
              value="history"
              data-testid="tab-history"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              History ({finalFilteredHistoryData.length})
            </TabsTrigger>
          </TabsList>

          <div className="mb-4 flex gap-2 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 p-1 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setDateFilterTab("")}
              className={`px-4 py-2 rounded-md transition-all bg-transparent text-gray-700 hover:bg-green-100 border border-red-500`}
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => setDateFilterTab("today")}
              className={`px-4 py-2 rounded-md transition-all ${
                dateFilterTab === "today"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-green-100"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateFilterTab("upcoming")}
              className={`px-4 py-2 rounded-md transition-all ${
                dateFilterTab === "upcoming"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-green-100"
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setDateFilterTab("overdue")}
              className={`px-4 py-2 rounded-md transition-all ${
                dateFilterTab === "overdue"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-red-100"
              }`}
            >
              Overdue
            </button>
          </div>
        </div>

        <TabsContent value="pending">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Pending Follow-Ups
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
                        {/* NEW COLUMN HEADER */}
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Quotation No.
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Phone Number
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Enquiry Receiver
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
                          Basic Amount
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Total Amount
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation PDF
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Shared By
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Share Through
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Remarks
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Next Action
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Next Date Of Call
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {finalFilteredPendingData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={17} // <-- Updated colSpan
                            className="text-center py-8 bg-white"
                            data-testid="text-no-pending"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No pending follow-ups found.
                              </h1>
                            )}
                          </td>
                        </tr>
                      ) : (
                        finalFilteredPendingData.map((ticket, ind) => (
                          <tr
                            key={ticket.id}
                            className={
                              ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                            }
                          >
                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                onClick={() => handleFollowUpClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 transition-all duration-300 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md group"
                                data-testid={`button-followup-${ticket.id}`}
                              >
                                <span className="font-medium">Follow-Up</span>
                              </Button>
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {ticket.ticketId}
                            </td>
                            {/* NEW COLUMN CELL */}
                            <td className="px-4 py-3 font-medium text-blue-800">
                              {ticket.quotationNo}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.clientName}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.phoneNumber}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.enquiryReceiverName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.warrantyCheck || "0"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.machineName || "0"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.enquiryType || "0"}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.engineerAssign || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.siteName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.basicAmount || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.totalAmoutWithTex || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.quotationPdfLink ? (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(
                                      ticket.quotationPdfLink,
                                      "_blank"
                                    );
                                  }}
                                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium px-2 py-1 rounded transition-colors"
                                >
                                  Download
                                </button>
                              ) : (
                                <span className="text-gray-400">No file</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.quotationShareByPersonName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.ShareThrough || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.quotationremarks || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.nextAction || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.nextDateOfCall) || ""}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-4">
                    {finalFilteredPendingData.length === 0 ? (
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
                            No pending follow-ups found.
                          </h1>
                        )}
                      </div>
                    ) : (
                      finalFilteredPendingData.map((ticket, ind) => (
                        <Card
                          key={ticket.id}
                          className={`${
                            ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                          } border-l-4 border-l-blue-500`}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Header with Ticket ID and Action */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-blue-800 text-lg">
                                  {ticket.ticketId}
                                </h3>
                                {/* NEW: Quotation No in Mobile View */}
                                <p className="text-sm text-gray-700 font-medium">
                                  Quote: {ticket.quotationNo || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {ticket.clientName}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleFollowUpClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 border border-blue-200"
                              >
                                Follow-Up
                              </Button>
                            </div>

                            {/* Contact & Enquiry Info */}
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
                                  {ticket.enquiryReceiverName || "N/A"}
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
                                  {ticket.warrantyCheck || "N/A"}
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

                            {/* Financial Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Basic Amount
                                </p>
                                <p className="text-blue-900">
                                  {ticket.basicAmount || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Total Amount
                                </p>
                                <p className="text-blue-900">
                                  {ticket.totalAmoutWithTex || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Quotation Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Shared By
                                </p>
                                <p className="text-blue-900">
                                  {ticket.quotationShareByPersonName || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Share Through
                                </p>
                                <p className="text-blue-900">
                                  {ticket.ShareThrough || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Quotation PDF */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Quotation PDF
                              </p>
                              {ticket.quotationPdfLink ? (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(
                                      ticket.quotationPdfLink,
                                      "_blank"
                                    );
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Download PDF
                                </button>
                              ) : (
                                <p className="text-blue-900">No file</p>
                              )}
                            </div>

                            {/* Follow-up Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Next Action
                                </p>
                                <p className="text-blue-900">
                                  {ticket.nextAction || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Next Call Date
                                </p>
                                <p className="text-blue-900">
                                  {formatDate(ticket.nextDateOfCall) || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Remarks */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Remarks
                              </p>
                              <p className="text-blue-900 line-clamp-2">
                                {ticket.quotationremarks || "N/A"}
                              </p>
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
              <CardTitle className="text-blue-800">Follow-Up History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="hidden sm:block w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Timestamp
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Ticket ID
                        </th>
                        {/* NEW COLUMN HEADER */}
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Quotation No.
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
                          Senior Attachments
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          PAYMENT MODE
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Senior approval
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Attachment
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
                        {/* <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Remarks
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {finalFilteredHistoryData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={13} // <-- Updated colSpan
                            className="text-center py-8 bg-white"
                            data-testid="text-no-history"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No follow-up history found.
                              </h1>
                            )}
                          </td>
                        </tr>
                      ) : (
                        [...finalFilteredHistoryData]
                          .reverse()
                          .reverse()
                          .map((ticket, ind) => (
                            <tr
                              key={ind}
                              className={
                                ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                              }
                            >
                              <td className="px-4 py-3 font-medium text-blue-800">
                                {formatDate(ticket.timestamp)}
                              </td>
                              <td className="px-4 py-3 font-medium text-blue-800">
                                {ticket.ticket_id}
                              </td>
                              {/* NEW COLUMN CELL */}
                              <td className="px-4 py-3 font-medium text-blue-800">
                                {ticket.quotation_no || ""}
                              </td>
                              <td className="px-4 py-3 font-medium text-blue-800">
                                {ticket.stage || ""}
                              </td>

                              <td className="px-4 py-3">
                                {ticket.payment_term_ || ""}
                              </td>
                              <td className="px-4 py-3 text-blue-900">
                                {ticket.acceptance_via || ""}
                              </td>

                              <td className="px-4 py-3 text-blue-900">
                                {ticket.acceptance_attachments_ ? (
                                  <a
                                    href={ticket.acceptance_attachments_}
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
                                {ticket.payment_mode || ""}
                              </td>

                              <td className="px-4 py-3 text-blue-900">
                                {ticket.senior_approval || ""}
                              </td>

                              <td className="px-4 py-3 text-blue-900">
                                {ticket.approval_attachment ? (
                                  <a
                                    href={ticket.approval_attachment}
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
                                {ticket.what_did_the_customer_say || ""}
                              </td>

                              <td className="px-4 py-3 text-blue-900">
                                {ticket.next_action || ""}
                              </td>

                              <td className="px-4 py-3 text-blue-900">
                                {formatDate(ticket.next_date_of_call) || ""}
                              </td>

                              {/* <td className="px-4 py-3 text-blue-900">
                                {ticket.quotationremarks || ""}
                              </td> */}
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {finalFilteredHistoryData.length === 0 ? (
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
                            No follow-up history found.
                          </h1>
                        )}
                      </div>
                    ) : (
                      [...finalFilteredHistoryData].map((ticket, ind) => (
                        <Card
                          key={ind}
                          className={`${
                            ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                          } border-l-4 border-l-blue-500`}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Header */}
                            <div>
                              <h3 className="font-bold text-blue-800 text-lg">
                                {ticket.ticket_id}
                              </h3>
                              {/* NEW: Quotation No in Mobile View */}
                              <p className="text-sm text-gray-700 font-medium">
                                Quote: {ticket.quotation_no || "N/A"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(ticket.timestamp)}
                              </p>
                            </div>

                            {/* Stage & Payment */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Stage
                                </p>
                                <p className="text-blue-900">
                                  {ticket.stage || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Payment Term
                                </p>
                                <p className="text-blue-900">
                                  {ticket.payment_term_ || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Acceptance & Payment Mode */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Acceptance Via
                                </p>
                                <p className="text-blue-900">
                                  {ticket.acceptance_via || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Payment Mode
                                </p>
                                <p className="text-blue-900">
                                  {ticket.payment_mode || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Senior Approval */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Senior Approval
                              </p>
                              <p className="text-blue-900">
                                {ticket.senior_approval || "N/A"}
                              </p>
                            </div>

                            {/* Attachments */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Senior Attachments
                                </p>
                                {ticket.acceptance_attachments_ ? (
                                  <a
                                    href={ticket.acceptance_attachments_}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <p className="text-blue-900">N/A</p>
                                )}
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Client Attachment
                                </p>
                                {ticket.approval_attachment ? (
                                  <a
                                    href={ticket.approval_attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <p className="text-blue-900">N/A</p>
                                )}
                              </div>
                            </div>

                            {/* Customer Feedback */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Customer Feedback
                              </p>
                              <p className="text-blue-900 line-clamp-2">
                                {ticket.what_did_the_customer_say || "N/A"}
                              </p>
                            </div>

                            {/* Next Steps */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Next Action
                                </p>
                                <p className="text-blue-900">
                                  {ticket.next_action || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Next Call Date
                                </p>
                                <p className="text-blue-900">
                                  {formatDate(ticket.next_date_of_call) ||
                                    "N/A"}
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
      </Tabs>

      {/* Follow-Up Modal */}
      <Modal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        title="Follow-Up"
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
          {/* NEW: Quotation No Field in Modal */}
          <div>
            <Label>Quotation No.</Label>
            <Input
              value={formData.quotationNo || ""}
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
              <div>
                <Label>Stage</Label>
                <Select
                  value={formData.stage || undefined} // Use undefined instead of empty string
                  onValueChange={(value) => handleInputChange("stage", value)}
                >
                  <SelectTrigger data-testid="select-stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                    {masterData.length > 0 && masterData[0]["Stage"] ? (
                      masterData[0]["Stage"].map(
                        (item, ind) =>
                          item && ( // Only render if item is not empty
                            <SelectItem
                              key={ind}
                              value={item}
                              className="hover:bg-blue-50 focus:bg-blue-50"
                            >
                              {item}
                            </SelectItem>
                          )
                      )
                    ) : (
                      <SelectItem value="loading" disabled>
                        Loading options...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional fields based on stage */}
              {renderConditionalFields()}

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
                  onClick={() => setShowFollowUpModal(false)}
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
