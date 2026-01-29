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
import {
  Eye,
  ClipboardList,
  User,
  Clipboard,
  Settings,
  Save,
  Loader2Icon,
  LoaderIcon,
} from "lucide-react";
import { Textarea } from "../components/ui/textarea";

export default function ClientDetails() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingTickets, setPendingTickets] = useState([]);
  const [historyTickets, setHistoryTickets] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({});
  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterData, setMasterData] = useState({});
  const [searchItem, setSearchItem] = useState("");
  const [showCustomMachineInput, setShowCustomMachineInput] = useState(false);
  const [customMachineName, setCustomMachineName] = useState("");
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [videoCallValue, setVideoCallValue] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [showCustomCompanyInput, setShowCustomCompanyInput] = useState(false);
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // const [selectedMachines, setSelectedMachines] = useState([]);

  const { toast } = useToast();

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
          // siteName: row[22], // Site Name
          companyName: row[23], // Company Name
          siteAddress: row[24], // Site Address
          gstAddress: row[25], // GST Address
          state: row[26], // State
          pinCode: row[27], // PIN Code
          engineerAssign: row[28], // Engineer Name
          serviceLocation: row[29], // Service Location
          uploadChallan: row[30],
          sentOtp: row[117], // NEW: Column DN (index 117 for DN column)
          CREName: row[127], // NEW: Column DN (index 117 for DN column)
        }));

        // Create a map to store unique tickets by Ticket ID, keeping the latest one
        const uniqueTicketsMap = new Map();
        allData.forEach((ticket) => {
          if (ticket.ticketId) {
            uniqueTicketsMap.set(ticket.ticketId, ticket);
          }
        });

        // Convert map back to array
        const uniqueAllData = Array.from(uniqueTicketsMap.values());

        // Filter data based on your conditions
        const pending = uniqueAllData.filter(
          (item) => item.planned1 && !item.actual1
        );
        const history = uniqueAllData.filter((item) => item.planned1 && item.actual1);

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

  const fetchClientData = async () => {
    try {
      const response = await fetch(`${sheet_url}?sheet=CLIENT DATA`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const processedData = result.data
          .slice(1)
          .map((row) => ({
            companyName: row[0] || "", // Column A
            state: row[3] || "", // Column D
            gstNo: row[4] || "", // Column E
            siteAddress: row[5] || "", // Column F
          }))
          .filter((item) => item.companyName.trim() !== "");

        setClientData(processedData);
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
      toast({
        title: "Error",
        description: "Failed to load client data",
        variant: "destructive",
      });
    }
  };

  // Handle company selection and auto-fill related fields
  const handleCompanySelection = (selectedCompany) => {
    const companyData = clientData.find(
      (item) => item.companyName === selectedCompany
    );

    if (companyData) {
      setFormData((prev) => ({
        ...prev,
        companyName: selectedCompany,
        state: companyData.state,
        pinCode: companyData.gstNo, // GST No field
        siteAddress: companyData.siteAddress,
      }));
      setIsAutoFilled(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        companyName: selectedCompany,
      }));
      setIsAutoFilled(false);
    }
  };

  // Save new company data to CLIENT DATA sheet
  const saveCustomCompanyName = async (
    companyName,
    state,
    gstNo,
    siteAddress
  ) => {
    try {
      setCustomLoading(true);

      const rowData = [companyName, "", "", state, gstNo, siteAddress]; // A,B,C,D,E,F columns

      // Create form data manually to avoid encoding issues
      const formData = new FormData();
      formData.append("sheetName", "CLIENT DATA");
      formData.append("action", "insert");
      formData.append("rowData", JSON.stringify(rowData));

      const response = await fetch(sheet_url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Add to local clientData state
        const newCompanyData = {
          companyName: companyName,
          state: state,
          gstNo: gstNo,
          siteAddress: siteAddress,
        };

        setClientData((prev) => [...prev, newCompanyData]);

        // Auto-fill form data with the new company data
        setFormData((prev) => ({
          ...prev,
          companyName: companyName,
          state: state,
          pinCode: gstNo,
          siteAddress: siteAddress,
        }));

        setIsAutoFilled(true); // Mark as auto-filled

        toast({
          title: "Success",
          description: "Company data saved successfully and form updated",
        });
      } else {
        console.error("Save company error:", result.error);
        toast({
          title: "Error",
          description: `Failed to save company data: ${result.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving company data:", error);
      toast({
        title: "Error",
        description: "Failed to save company data",
        variant: "destructive",
      });
    } finally {
      setCustomLoading(false);
      setShowCustomCompanyInput(false);
      setCustomCompanyName("");
    }
  };

  // 3. UPDATE useEffect (Line 130 के आसपास में fetchClientData() add करें):
  useEffect(() => {
    fetchMasterSheet();
    fetchData();
    fetchClientData(); // ADD THIS LINE
  }, []);

  const [masterSheetLoading, setMasterSheetLoading] = useState(false);

  const fetchMasterSheet = async () => {
    try {
      setMasterSheetLoading(true);
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
            // Convert to string, keep empty values and duplicates
            const stringValue =
              value !== null && value !== undefined ? String(value).trim() : "";
            structuredData[header].push(stringValue); // Push all values including empty ones
          });
        });

        // DON'T remove duplicates - keep all values as they are
        // Object.keys(structuredData).forEach((key) => {
        //   structuredData[key] = [...new Set(structuredData[key])];
        // });

        // Specifically handle Engineer Assign Name from column H (index 7)
        if (
          !structuredData["Engineer Assign Name"] ||
          structuredData["Engineer Assign Name"].length === 0
        ) {
          const engineerNames = [];
          result.data.slice(1).forEach((row) => {
            const value =
              row[7] !== null && row[7] !== undefined
                ? String(row[7]).trim()
                : "";
            engineerNames.push(value); // Keep all values including empty
          });
          structuredData["Engineer Assign Name"] = engineerNames; // Don't remove duplicates
        }

        setMasterData([structuredData]);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
      toast.error("Failed to load master data");
    } finally {
      setMasterSheetLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterSheet();
    fetchData();
  }, []);

  const filteredPendingDataa = pendingData
    .filter((item) => {
      const phoneNumberStr = String(item.phoneNumber || "");
      const matchesSearch =
        item.ticketId?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.companyName?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchItem.toLowerCase()) ||
        phoneNumberStr?.toLowerCase().includes(searchItem.toLowerCase());
      // const matchesParty =
      //   filterParty === "all" || item.partyName === filterParty;
      // return matchesSearch && matchesParty;
      return matchesSearch;
    })
    .reverse();

  const filteredHistoryDataa = historyData
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

  useEffect(() => {
    const tickets = storage.getTickets();
    const pending = tickets.filter((t) => t.status === "pending");
    const history = tickets.filter((t) => t.status !== "pending");

    // setPendingTickets(pending);
    setHistoryTickets(history);
  }, []);

  const handleDetailsClick = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedMachines([]);
    setFormData({
      ticketId: ticket.id,
      clientName: ticket.clientName,
      phoneNumber: ticket.phoneNumber,
      category: ticket.category,
      priority: ticket.priority,
      title: ticket.title,
      description: ticket.description,
      date: ticket.date,
      callType: "",
      sourceOfEnquiry: "",
      enquiryReceiverName: "",
      warrantyCheck: "",
      billNumber: "",
      machineName: "",
      // machineName: ticket.machineName || "",
      enquiryType: "",
      siteName: "",
      companyName: "",
      gstAddress: "",
      siteAddress: "",
      state: "",
      pinCode: "",
      engineerAssign: "",
      serviceLocation: "",
      warehouseChallan: "",
      sentOtp: "", // Add this line
    });
    setShowDetailsModal(true);
  };

  const handleInputChange = (field, value) => {
    if (field === "requirementServiceCategory" && masterData[0]) {
      const serviceCategories = masterData[0]["Requirement Service Category"];
      const videoCallOptions = masterData[0]["Video Call"];

      // console.log("serviceCategories", serviceCategories);
      // console.log("videoCallOptions", videoCallOptions);

      const index = serviceCategories.indexOf(value);

      // console.log("videoCallOptions", videoCallOptions);
      // console.log("videoCallOptions[index]", videoCallOptions[index]);
      if (index !== -1 && videoCallOptions[index]) {
        console.log("videoCallOptions[index]", videoCallOptions[index]);
        setVideoCallValue(videoCallOptions[index]);
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field, values) => {
    setFormData((prev) => ({ ...prev, [field]: values.join(", ") }));
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
      const digit = Math.floor(Math.random() * 10).toString();
      result += digit.toString();
    }
    return result;
  }

  // console.log("selectedTicket",selectedTicket);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks - all should return to stop execution
    if (!formData.callType) {
      alert("Error: Please select Call Type");
      return;
    }
    if (!formData.requirementServiceCategory) {
      alert("Error: Please select Requirement Service Category");
      return;
    }
    if (!formData.enquiryType) {
      alert("Error: Please select Enquiry Type");
      return;
    }
    if (!formData.warrantyCheck) {
      alert("Error: Please select warrantyCheck");
      return;
    }
    if (!formData.enquiryReceiverName) {
      alert("Error: Please select Enquiry Receiver Name");
      return;
    }
    if (!formData.sourceOfEnquiry) {
      alert("Error: Please select source of Enquiry");
      return;
    }
    if (!formData.machineName) {
      alert("Error: Please select Machine Name");
      return;
    }
    if (!formData.engineerAssign) {
      alert("Error: Please select Engineer Name");
      return;
    }
    if (!formData.companyName) {
      alert("Error: Please fill Company Name");
      return;
    }
    if (!formData.gstAddress) {
      alert("Error: Please fill gst Address");
      return;
    }
    if (!formData.siteAddress) {
      alert("Error: Please fill site Address");
      return;
    }
    if (!formData.state) {
      alert("Error: Please fill state");
      return;
    }
    if (!formData.pinCode) {
      alert("Error: Please fill pin code");
      return;
    }
    if (!formData.serviceLocation) {
      alert("Error: Please select service Location");
      return;
    }

    if (!formData.sentOtp) {
      alert("Error: Please select sent OTP");
      return;
    }

    // Check for Warehouse requirement
    if (
      formData.serviceLocation === "Warehouse" &&
      !formData.warehouseChallan
    ) {
      alert("Error: Please add upload challan");
      return;
    }

    if (
      formData.warrantyCheck === "Yes" &&
      !formData.billNumber &&
      !formData.billAttachment
    ) {
      alert("Error: Please fill bill number or upload bill attachment");
      return;
    }

    setIsSubmitting(true); // Start loading
    let fileUrl = "";
    let fileUrlBillAttachment = "";

    if (formData.warehouseChallan) {
      const uploadResult = await uploadImageToDrive(formData.warehouseChallan);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }
      fileUrl = uploadResult.fileUrl;
    }
    if (formData.billAttachment) {
      const uploadResult = await uploadImageToDrive(formData.billAttachment);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }
      fileUrlBillAttachment = uploadResult.fileUrl;
    }

    const currentDateTime = formatDateTime(new Date());
    const id = selectedTicket?.id;
    const sixDigitNumber1 = generateSixDigitNumber();

    try {
      // Check if company exists in CLIENT DATA
      const companyExists = clientData.find(
        (item) =>
          item.companyName.toLowerCase() === formData.companyName.toLowerCase()
      );

      // If company doesn't exist, save it to CLIENT DATA sheet
      // If company doesn't exist, save it to CLIENT DATA sheet
      if (!companyExists) {
        try {
          const clientRowData = [
            formData.companyName, // Column A
            formData.clientName, // Column B
            formData.phoneNumber, // Column C
            formData.state, // Column D
            formData.pinCode, // Column E
            formData.siteAddress, // Column F
          ];

          // ✅ Build body manually to keep "CLIENT DATA" exactly same
          const bodyString =
            "sheetName=" +
            encodeURIComponent("CLIENT DATA").replace(/%20/g, " ") +
            "&action=insert" +
            "&rowData=" +
            encodeURIComponent(JSON.stringify(clientRowData));

          const clientResponse = await fetch(sheet_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: bodyString,
          });

          const clientResult = await clientResponse.json();

          if (clientResult.success) {
            // Update local clientData state
            setClientData((prev) => [
              ...prev,
              {
                companyName: formData.companyName,
                state: formData.state,
                gstNo: formData.pinCode,
                siteAddress: formData.siteAddress,
                phoneNumber: formData.phoneNumber,
                clientName: formData.clientName,
              },
            ]);
            console.log("✅ New company data saved to CLIENT DATA sheet");
          } else {
            console.error(
              "❌ Failed to save company data:",
              clientResult.error
            );
          }
        } catch (clientError) {
          console.error("Error saving to CLIENT DATA:", clientError);
        }
      }

      // console.log("videoCallValue", videoCallValue);

      // Continue with main ticket submission
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
            K: currentDateTime,
            M: formData.callType || "", // Call Type
            N: formData.requirementServiceCategory || "", // service category
            O: videoCallValue || "",
            P: formData.sourceOfEnquiry || "", // Source of Enquiry
            Q: formData.enquiryReceiverName || "", // Enquiry Receiver Name
            R: formData.warrantyCheck || "", // Warranty Check
            S: formData.billNumber || "", // Bill Number Input
            T: fileUrlBillAttachment || "", // Bill Attachment URL
            U: formData.machineName || "", // Machine Name
            V: formData.enquiryType || "", // Enquiry Type
            W: formData.siteName || "", // Enquiry Type
            X: formData.companyName || "", // Company Name
            Y: formData.gstAddress || "", // GST Address
            Z: formData.siteAddress || "", // Site Address
            AA: formData.state || "", // State
            AB: formData.pinCode || "", // PIN Code
            AC: formData.engineerAssign || "", // Engineer Name
            AD: formData.serviceLocation || "", // Service Location
            AE: fileUrl || "", // Upload Challan
            DN: formData.sentOtp || "", // NEW: Sent OTP (Column DN)
            AJ: sixDigitNumber1,
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
            actual1: currentDateTime,
            callType: formData.callType,
            sourceOfEnquiry: formData.sourceOfEnquiry,
            enquiryReceiverName: formData.enquiryReceiverName,
            warrantyCheck: formData.warrantyCheck,
            billNumberInput: formData.billNumber,
            machineName: formData.machineName,
            enquiryType2: formData.enquiryType,
            companyName: formData.companyName,
            gstAddress: formData.gstAddress,
            siteAddress: formData.siteAddress,
            state: formData.state,
            pinCode: formData.pinCode,
            engineerAssign: formData.engineerAssign,
            serviceLocation: formData.serviceLocation,
            uploadChallan: fileUrl,
            otherLocationDetails: "",
          },
          ...prevHistory,
        ]);

        toast({
          title: "Success",
          description:
            "Ticket details saved successfully" +
            (!companyExists ? " and new company data added" : ""),
        });
        setShowDetailsModal(false);
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
        "Client Details",
        formData.cancelRemarks || "",
        "Double Ticket",
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
        // fetchData();
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
        setShowDetailsModal(false);
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

  const [customLoading, setCustomLoading] = useState(false);

  const saveCustomMachineName = async (value) => {
    try {
      setCustomLoading(true);

      const response = await fetch(sheet_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          sheetId: Sheet_Id,
          sheetName: "Master",
          action: "appendToColumn",
          column: "G",
          value: value,
        }),
      });

      const result = await response.json();

      // console.log("Result", result);
    } catch (error) {
      console.error("Error saving custom machine:", error);
      toast({
        title: "error",
        description: "Failed to save custom machine name",
      });
    } finally {
      setCustomLoading(false);
      setShowCustomMachineInput(false);
      setCustomMachineName("");
      fetchMasterSheet();
      toast({
        title: "Success",
        description: "Custom machine name saved successfully",
      });
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return badges[priority?.toLowerCase()] || badges.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    // If the dateString is already in DD/MM/YYYY format, return as is
    if (typeof dateString === "string" && dateString.includes("/")) {
      // Check if it's already in DD/MM/YYYY format
      const parts = dateString.split(" ")[0].split("/"); // Take only date part, ignore time
      if (parts.length === 3) {
        return parts.join("/"); // Return the date part as is
      }
    }

    // Try to parse as date
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      // If parsing fails, return the original string
      return dateString;
    }

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
    <div className="space-y-2">
      {/* Filter Options */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="sm:pt-6">
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
            History({filteredHistoryData?.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Pending Tickets</CardTitle>
            </CardHeader>
            <CardContent>
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
                          Ticket ID
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Client Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Phone Number
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Email Address
                        </th>
                        {/* <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Delay Days
                        </th> */}
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Category
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Priority
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Company Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[250px] sticky top-0">
                          Description
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">
                          Date
                        </th>
                      </tr>
                    </thead>
                    {/* Table body - scrollable */}
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredPendingData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-pending"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No pending tickets found.
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
                                onClick={() => handleDetailsClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 transition-all duration-300 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md group"
                                data-testid={`button-details-${ticket["Ticket ID"]}`}
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
                              {ticket.emailAddress}
                            </td>
                            {/* <td className="px-4 py-3 text-red-900">
                              {Math.round(ticket.delay1)}
                            </td> */}
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.category}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(
                                  ticket["Priority"]
                                )}`}
                              >
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.title}
                            </td>
                            <td className="px-4 py-3 max-w-xs text-blue-900 truncate hover:whitespace-normal hover:max-w-prose hover:overflow-visible hover:z-20 hover:bg-white hover:shadow-lg hover:border hover:border-blue-200 hover:rounded">
                              {ticket.description}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket?.timeStemp)}
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
                            No pending tickets found.
                          </h1>
                        )}
                      </div>
                    ) : (
                      filteredPendingData.map((ticket, ind) => (
                        <Card
                          key={ind}
                          className={`border-l-4 ${ticket.priority?.toLowerCase() === "high"
                            ? "border-l-red-500"
                            : ticket.priority?.toLowerCase() === "medium"
                              ? "border-l-yellow-500"
                              : "border-l-green-500"
                            } ${ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"}`}
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
                                onClick={() => handleDetailsClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 border border-blue-200"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                            </div>

                            {/* Priority Badge */}
                            <div>
                              <span
                                className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(
                                  ticket.priority
                                )}`}
                              >
                                {ticket.priority}
                              </span>
                            </div>

                            {/* Contact Info */}
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
                                  Email
                                </p>
                                <p className="text-blue-900 truncate">
                                  {ticket.emailAddress}
                                </p>
                              </div>
                            </div>

                            {/* Category and Date */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Category
                                </p>
                                <p className="text-blue-900">
                                  {ticket.category}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Date
                                </p>
                                <p className="text-blue-900">
                                  {formatDate(ticket?.timeStemp)}
                                </p>
                              </div>
                            </div>

                            {/* Company Name */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Company Name
                              </p>
                              <p className="text-blue-900 font-medium">
                                {ticket.title}
                              </p>
                            </div>

                            {/* Description */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Description
                              </p>
                              <p className="text-blue-900 line-clamp-3">
                                {ticket.description}
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
              <CardTitle className="text-blue-800">History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                {/* Table container with fixed header and scrollable body */}
                <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
                  <table className="hidden sm:block w-full">
                    {/* Table header - fixed */}
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
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Email Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">
                          Delay Days
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Call Type
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Source of Enquiry
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Enquiry Receiver Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Warranty Check
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Bill Number
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Bill Attachment
                        </th>

                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Machine Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Enquiry Type
                        </th>
                        {/* <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Site Name
                        </th> */}
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Company Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          GST Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Site Address
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          State
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          GST NO.
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Engineer Name
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Service Location
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Sent OTP
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Warehouse Challan
                        </th>
                      </tr>
                    </thead>
                    {/* Table body - scrollable */}
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredHistoryData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={20}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-history"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No history found.
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
                              {ticket.emailAddress}
                            </td>
                            <td className="px-4 py-3 text-red-900">
                              {Math.round(ticket.delay1)}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.callType || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.sourceOfEnquiry || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.enquiryReceiverName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.warrantyCheck || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.billNumberInput || ""}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.billAttachmentFile ? (
                                <a
                                  href={ticket.billAttachmentFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xl"
                                >
                                  View
                                </a>
                              ) : (
                                ""
                              )}
                            </td>

                            <td className="px-4 py-3 text-blue-900">
                              {ticket.machineName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.enquiryType || ""}
                            </td>
                            {/* <td className="px-4 py-3 text-blue-900">
                              {ticket.siteName || ""}
                            </td> */}
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.companyName || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.gstAddress || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.siteAddress || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.state || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.pinCode || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.engineerAssign || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.serviceLocation || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.sentOtp || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {ticket.uploadChallan ? (
                                <a
                                  href={ticket.uploadChallan}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xl"
                                >
                                  View
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
                          <h1 className="text-blue-700">No history found.</h1>
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
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-blue-800 text-lg">
                                  {ticket.ticketId}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {ticket.clientName}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-red-900 font-bold">
                                  {Math.round(ticket.delay1)} days
                                </p>
                              </div>
                            </div>

                            {/* Contact Info */}
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
                                  Email
                                </p>
                                <p className="text-blue-900 truncate">
                                  {ticket.emailAddress}
                                </p>
                              </div>
                            </div>

                            {/* Call Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Call Type
                                </p>
                                <p className="text-blue-900">
                                  {ticket.callType || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Enquiry Source
                                </p>
                                <p className="text-blue-900">
                                  {ticket.sourceOfEnquiry || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Warranty & Bill Info */}
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
                                  Bill Number
                                </p>
                                <p className="text-blue-900">
                                  {ticket.billNumberInput || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Machine & Enquiry Info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Machine
                                </p>
                                <p className="text-blue-900">
                                  {ticket.machineName || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Enquiry Type
                                </p>
                                <p className="text-blue-900">
                                  {ticket.enquiryType || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Company Info */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Company Name
                              </p>
                              <p className="text-blue-900 font-medium">
                                {ticket.companyName || "N/A"}
                              </p>
                            </div>

                            {/* Address Info */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Site Address
                              </p>
                              <p className="text-blue-900 line-clamp-2">
                                {ticket.siteAddress || "N/A"}
                              </p>
                            </div>

                            {/* Engineer & Service */}
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
                                  Service Location
                                </p>
                                <p className="text-blue-900">
                                  {ticket.serviceLocation || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Attachments */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Bill Attachment
                                </p>
                                {ticket.billAttachmentFile ? (
                                  <a
                                    href={ticket.billAttachmentFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    View Bill
                                  </a>
                                ) : (
                                  <p className="text-blue-900">N/A</p>
                                )}
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Warehouse Challan
                                </p>
                                {ticket.uploadChallan ? (
                                  <a
                                    href={ticket.uploadChallan}
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

      {/* Details Modal - Remaining exactly the same as before */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <span>Ticket Details</span>
          </div>
        }
        size="4xl"
        className="rounded-lg max-h-[90vh] overflow-y-auto"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-h-[70vh] overflow-y-auto p-2"
        >
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Ticket ID</p>
                <p className="font-semibold">
                  {selectedTicket?.ticketId || ""}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Client</p>
                <p className="font-semibold">
                  {selectedTicket?.clientName || ""}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Pending
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Priority</p>
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(
                    selectedTicket?.priority
                  )}`}
                >
                  {selectedTicket?.priority || "Medium"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gray-50 px-4 py-3 flex flex-row justify-between items-center">
                <CardTitle className="text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Client Information
                </CardTitle>

                <div className="flex items-center space-x-2">
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
              </CardHeader>

              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Phone Number</Label>
                  <Input
                    value={selectedTicket?.phoneNumber}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Email Address</Label>
                  <Input
                    value={selectedTicket?.emailAddress}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Category</Label>
                  <Input
                    value={selectedTicket?.category}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {!isCancelled && (
            <>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gray-50 px-4 py-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clipboard className="w-4 h-4 mr-2" />
                    Enquiry Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">Call Type *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("callType", value)
                      }
                      value={formData.callType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select call type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        {masterData[0]?.["Call type"]
                          ?.filter((item) => item && item.trim() !== "")
                          .map((option) => (
                            <SelectItem key={option} value={option || ""}>
                              {option}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm">Source of Enquiry *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("sourceOfEnquiry", value)
                      }
                    >
                      <SelectTrigger
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        data-testid="select-person-name"
                      >
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        {masterData.length > 0 &&
                          masterData[0]["Source of enquiry"] ? (
                          masterData[0]["Source of enquiry"]
                            ?.filter((item) => item && item.trim() !== "")
                            .map((item, ind) => (
                              <SelectItem
                                key={ind}
                                value={item || ""}
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

                  <div className="space-y-1">
                    <Label className="text-sm">Enquiry Receiver Name *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("enquiryReceiverName", value)
                      }
                      value={formData.enquiryReceiverName}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select receiver" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        {masterData[0]?.["Enquiry Receiver Name"]
                          ?.filter((item) => item && item.trim() !== "")
                          .map((option) => (
                            <SelectItem key={option} value={option || ""}>
                              {option}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Warranty Check *</Label>
                    <Select
                      onValueChange={(value) => {
                        handleInputChange("warrantyCheck", value);
                        if (value !== "Yes") {
                          handleInputChange("billNumber", "");
                        }
                      }}
                      value={formData.warrantyCheck}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select warranty status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        {masterData[0]?.["Warranty Check"]
                          ?.filter((item) => item && item.trim() !== "")
                          .map((option) => (
                            <SelectItem key={option} value={option || ""}>
                              {option}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.warrantyCheck === "Yes" && (
                    <div className="space-y-1">
                      <Label className="text-sm">Bill Number *</Label>
                      <Input
                        value={formData.billNumber || ""}
                        onChange={(e) =>
                          handleInputChange("billNumber", e.target.value)
                        }
                      />
                    </div>
                  )}

                  {formData.warrantyCheck === "Yes" && (
                    <div className="space-y-1">
                      <Label className="text-sm">Bill Attachments *</Label>
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleInputChange("billAttachment", e.target.files[0])
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-sm">Enquiry Type *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("enquiryType", value)
                      }
                      value={formData.enquiryType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select enquiry type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        {masterData[0]?.["Enquiry Type"]
                          ?.filter((item) => item && item.trim() !== "")
                          .map((option) => (
                            <SelectItem key={option} value={option || ""}>
                              {option}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm">
                      Requirement Service Category *
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("requirementServiceCategory", value)
                      }
                      value={formData.requirementServiceCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Requirement Service Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        {masterData[0]?.["Requirement Service Category"]
                          ?.filter((item) => item && item.trim() !== "")
                          .map((option) => (
                            <SelectItem key={option} value={option || ""}>
                              {option}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gray-50 px-4 py-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">Machine Name *</Label>
                    {showCustomMachineInput ? (
                      <div className="flex gap-2">
                        <Input
                          value={customMachineName}
                          onChange={(e) => setCustomMachineName(e.target.value)}
                          placeholder="Enter custom machine name"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            saveCustomMachineName(customMachineName);
                          }}
                          size="sm"
                          disabled={customLoading}
                        >
                          {" "}
                          {customLoading && (
                            <Loader2Icon className="animate-spin" />
                          )}
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCustomMachineInput(false)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Select
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setShowCustomMachineInput(true);
                              } else if (!selectedMachines.includes(value)) {
                                const newSelected = [
                                  ...selectedMachines,
                                  value,
                                ];
                                setSelectedMachines(newSelected);
                                handleInputChange(
                                  "machineName",
                                  newSelected.join(", ")
                                );
                                // Don't close the dropdown
                              }
                            }}
                            value=""
                            // This prevents the dropdown from closing after selection
                            onOpenChange={(open) => {
                              if (!open && selectedMachines.length === 0) {
                                // Only close if clicking outside and no selections made
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select machine(s)" />
                            </SelectTrigger>
                            {/* <SelectContent
                              className="bg-white border border-gray-300 rounded-md shadow-lg"
                              // Prevent click events from bubbling up
                              onPointerDownOutside={(e) => e.preventDefault()}
                              onInteractOutside={(e) => {
                                // Only close if clicking outside the dropdown
                                const target = e.target;
                                if (!target.closest(".SelectContent")) {
                                  // Close the dropdown
                                  document.dispatchEvent(
                                    new KeyboardEvent("keydown", {
                                      key: "Escape",
                                    })
                                  );
                                }
                              }}
                            >
                              <SelectItem
                                value="custom"
                                className="font-bold text-blue-600"
                              >
                                + Add Custom Machine
                              </SelectItem>
                              {masterData[0]?.["Machine Name"]?.filter(item => item && item.trim() !== "").map(
                                (option) => (
                                  <SelectItem
                                    key={option}
                                    value={option || ""}
                                    disabled={selectedMachines.includes(option)}
                                  >
                                    {option}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent> */}
                            <SelectContent
                              className="bg-white border border-gray-300 rounded-md shadow-lg"
                              // Prevent click events from bubbling up
                              onPointerDownOutside={(e) => e.preventDefault()}
                              onInteractOutside={(e) => {
                                // Only close if clicking outside the dropdown
                                const target = e.target;
                                if (!target.closest(".SelectContent")) {
                                  // Close the dropdown
                                  document.dispatchEvent(
                                    new KeyboardEvent("keydown", {
                                      key: "Escape",
                                    })
                                  );
                                }
                              }}
                            >
                              <SelectItem
                                value="custom"
                                className="font-bold text-blue-600"
                              >
                                + Add Custom Machine
                              </SelectItem>
                              {masterSheetLoading ? (
                                <SelectItem value="loading" disabled>
                                  <div className="flex items-center">
                                    <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
                                    Loading...
                                  </div>
                                </SelectItem>
                              ) : (
                                masterData[0]?.["Machine Name"]
                                  ?.filter((item) => item && item.trim() !== "")
                                  .map((option) => (
                                    <SelectItem
                                      key={option}
                                      value={option || ""}
                                      disabled={selectedMachines.includes(
                                        option
                                      )}
                                    >
                                      {option}
                                    </SelectItem>
                                  ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedMachines.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedMachines.map((machine) => (
                              <div
                                key={machine}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
                              >
                                {machine}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSelected = selectedMachines.filter(
                                      (m) => m !== machine
                                    );
                                    setSelectedMachines(newSelected);
                                    handleInputChange(
                                      "machineName",
                                      newSelected.join(", ")
                                    );
                                  }}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm">Engineer Name *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("engineerAssign", value)
                      }
                      value={formData.engineerAssign}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select engineer" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        {masterData[0]?.["Engineer Assign Name"]
                          ?.filter((item) => item && item.trim() !== "")
                          .map((option) => (
                            <SelectItem key={option} value={option || ""}>
                              {option}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-sm">Mention Issue</Label>
                    <Input
                      value={formData.siteName || ""}
                      onChange={(e) =>
                        handleInputChange("siteName", e.target.value)
                      }
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-sm">Company Name *</Label>
                    {showCustomCompanyInput ? (
                      <div className="space-y-2">
                        <Input
                          value={customCompanyName}
                          onChange={(e) => setCustomCompanyName(e.target.value)}
                          placeholder="Enter new company name"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              if (customCompanyName.trim()) {
                                handleInputChange(
                                  "companyName",
                                  customCompanyName
                                );
                                setShowCustomCompanyInput(false);
                                setIsAutoFilled(false);
                              }
                            }}
                            size="sm"
                            disabled={!customCompanyName.trim()}
                          >
                            Add Company
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowCustomCompanyInput(false);
                              setCustomCompanyName("");
                            }}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative">
                          <Input
                            value={formData.companyName || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleInputChange("companyName", value);

                              // typing करते समय dropdown दिखे
                              setShowDropdown(true);

                              // Check if entered value matches any existing company
                              const matchedCompany = clientData.find(
                                (c) =>
                                  c.companyName.toLowerCase() ===
                                  value.toLowerCase()
                              );

                              if (matchedCompany) {
                                handleCompanySelection(
                                  matchedCompany.companyName
                                );
                              } else {
                                setIsAutoFilled(false);
                              }
                            }}
                            onBlur={() =>
                              setTimeout(() => setShowDropdown(false), 150)
                            }
                            placeholder="Type to search or select company name"
                            className="pr-10"
                            list="company-suggestions"
                          />

                          <datalist id="company-suggestions">
                            {clientData
                              .filter((company) =>
                                company.companyName
                                  .toLowerCase()
                                  .includes(
                                    (formData.companyName || "").toLowerCase()
                                  )
                              )
                              .map((company, index) => (
                                <option
                                  key={index}
                                  value={company.companyName}
                                />
                              ))}
                          </datalist>

                          {/* Dropdown icon */}
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg
                              className="h-4 w-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Custom dropdown */}
                        {showDropdown && formData.companyName && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            <div
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer font-bold text-blue-600 border-b"
                              onClick={() => {
                                setShowCustomCompanyInput(true);
                                setShowDropdown(false);
                              }}
                            >
                              + Add New Company: "{formData.companyName}"
                            </div>
                            {clientData
                              .filter((company) =>
                                company.companyName
                                  .toLowerCase()
                                  .includes(formData.companyName.toLowerCase())
                              )
                              .map((company, index) => (
                                <div
                                  key={index}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    handleCompanySelection(company.companyName);
                                    setShowDropdown(false); // select के बाद dropdown hide
                                  }}
                                >
                                  {company.companyName}
                                </div>
                              ))}
                            {clientData.filter((company) =>
                              company.companyName
                                .toLowerCase()
                                .includes(formData.companyName.toLowerCase())
                            ).length === 0 && (
                                <div className="px-3 py-2 text-gray-500">
                                  No matching companies found
                                </div>
                              )}
                          </div>
                        )}

                        {formData.companyName &&
                          !clientData.find(
                            (c) => c.companyName === formData.companyName
                          ) &&
                          !showCustomCompanyInput && (
                            <div className="mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (
                                    formData.companyName &&
                                    formData.state &&
                                    formData.pinCode &&
                                    formData.siteAddress
                                  ) {
                                    saveCustomCompanyName(
                                      formData.companyName,
                                      formData.state,
                                      formData.pinCode,
                                      formData.siteAddress
                                    );
                                  } else {
                                    toast({
                                      title: "Error",
                                      description:
                                        "Please fill all company details before saving",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="text-blue-600"
                              >
                                Save Company Data
                              </Button>
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-sm">Site Address *</Label>
                    <Input
                      value={formData.gstAddress || ""}
                      onChange={(e) => {
                        handleInputChange("gstAddress", e.target.value);
                        if (isAutoFilled) setIsAutoFilled(false);
                      }}
                      className={
                        isAutoFilled ? "bg-green-50 border-green-200" : ""
                      }
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-sm">
                      GST Address *{" "}
                      {isAutoFilled && (
                        <span className="text-green-600 text-xs">
                          (Auto-filled)
                        </span>
                      )}
                    </Label>
                    <Input
                      value={formData.siteAddress || ""}
                      onChange={(e) => {
                        handleInputChange("siteAddress", e.target.value);
                        if (isAutoFilled) setIsAutoFilled(false);
                      }}
                      className={
                        isAutoFilled ? "bg-green-50 border-green-200" : ""
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm">
                      State *{" "}
                      {isAutoFilled && (
                        <span className="text-green-600 text-xs">
                          (Auto-filled)
                        </span>
                      )}
                    </Label>
                    <Input
                      value={formData.state || ""}
                      onChange={(e) => {
                        handleInputChange("state", e.target.value);
                        if (isAutoFilled) setIsAutoFilled(false);
                      }}
                      className={
                        isAutoFilled ? "bg-green-50 border-green-200" : ""
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm">
                      GST NO. *{" "}
                      {isAutoFilled && (
                        <span className="text-green-600 text-xs">
                          (Auto-filled)
                        </span>
                      )}
                    </Label>
                    <Input
                      value={formData.pinCode || ""}
                      onChange={(e) => {
                        handleInputChange("pinCode", e.target.value);
                        if (isAutoFilled) setIsAutoFilled(false);
                      }}
                      className={
                        isAutoFilled ? "bg-green-50 border-green-200" : ""
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm">Service Location *</Label>
                    <Select
                      onValueChange={(value) => {
                        handleInputChange("serviceLocation", value);
                        if (value !== "Warehouse") {
                          handleInputChange("warehouseChallan", "");
                        }
                      }}
                      value={formData.serviceLocation}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service location" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        <SelectItem value="On-Site">On-Site</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.serviceLocation === "Warehouse" && (
                    <div className="space-y-1">
                      <Label className="text-sm">Upload Challan *</Label>
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleInputChange(
                            "warehouseChallan",
                            e.target.files[0]
                          )
                        }
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-sm">Sent OTP *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("sentOtp", value)
                      }
                      value={formData.sentOtp}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
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

          {!isCancelled && (
            <div className="md:col-span-2 flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-300"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting && (
                  <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
