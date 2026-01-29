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

export default function EngineerApproval() {
  const [lastOtpGenerations, setLastOtpGenerations] = useState({});
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingTickets, setPendingTickets] = useState([]);
  const [historyTickets, setHistoryTickets] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
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
    "https://script.google.com/macros/s/AKfycbwu7wzvou_bj7zZvM1q5NCzTgHMaO6WMZVswb3aNG8VJ42Jz1W_sAd4El42tgmg3JKC/exec";
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
          CREName: row[127],
        }));

        // Filter data based on your conditions

        // console.log("Alldata", allData);

        const pending = allData.filter(
          (item) => item.planned10 !== "" && item.actual10 === ""
        );
        // console.log("pending", pending);

        const history = allData.filter(
          (item) => item.planned10 !== "" && item.actual10 !== ""
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
    const pending = tickets.filter((t) => t.status === "site-visit-completed");
    const history = tickets.filter(
      (t) => t.status === "engineer-approval-completed"
    );

    setPendingTickets(pending);
    setHistoryTickets(history);
  }, []);

  const handleApprovalClick = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      ticketId: ticket.ticketId,
      clientName: ticket.clientName,
      phoneNumber: ticket.phoneNumber,
      enquiryReceiverName: ticket.enquiryReceiverName || "",
      warrantyCheck: ticket.warrantyCheck || "",
      machineName: ticket.machineName || "",
      travelDate: ticket.travelDate || "",
      returnDate: ticket.returnDate || "",
      approval: ticket.approval || "",
      approvalName: ticket.approvalName || "",
      siteVisitDate: "",
      otpVerification: "",
    });
    setShowApprovalModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true); // Start loading

    if (!formData.siteVisitDate) {
      alert("Please Select Site Visit Date");
      setIsSubmitting(false);
      return;
    }

    if (
      formData?.otpVerification?.toString() !==
      selectedTicket?.otpVerification?.toString()
    ) {
      alert("Wrong OPT, Please Enter Right OTP");
      setIsSubmitting(false);
      return;
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
            CW: currentDateTime,
            CY: formData.siteVisitDate,
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
            actual8: currentDateTime,
            siteVisitDate: formData.siteVisitDate,
            verificationStatus:
              formData.otpVerification.toString() ===
                selectedTicket.otpVerification.toString()
                ? "yes"
                : "no",
          },
          ...prevHistory,
        ]);

        toast({
          title: "Success",
          description: "Ticket details saved successfully",
        });

        setShowApprovalModal(false);
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
        "Site Visit OTP Verification", // Enquiry Type (second one)
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
        setShowApprovalModal(false);
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
        localStorage.getItem("lastOtpVerificationGenerations") || "{}"
      );
      storedGenerations[ticketId] = new Date().toISOString();
      localStorage.setItem(
        "lastOtpVerificationGenerations",
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
            CZ: sixDigitNumber1,
            DA: "Regenerated OTP",
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
          otpVerification: sixDigitNumber1,
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
    const storedGenerations = localStorage.getItem(
      "lastOtpVerificationGenerations"
    );
    if (storedGenerations) {
      setLastOtpGenerations(JSON.parse(storedGenerations));
    }
  }, []);

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

  const userName = localStorage.getItem("currentUsername");

  const roleStorage = localStorage.getItem("o2d-auth-storage");
  const parsedData = JSON.parse(roleStorage);
  const role = parsedData.state.user.role;

  const filteredPendingData = role === "user" ? filteredPendingDataa.filter(
    (item) => item["CREName"] === userName
  ) : role === "engineer" ? filteredPendingDataa.filter((item) => item["engineerAssign"] === userName) : filteredPendingDataa;

  const filteredHistoryData = role === "user" ? filteredHistoryDataa.filter(
    (item) => item["CREName"] === userName
  ) : role === 'engineer' ? filteredHistoryDataa.filter((item) => item["engineerAssign"] === userName) : filteredHistoryDataa;


  // console.log("filteredHistoryDataa", filteredHistoryDataa);

  return (
    <div className="space-y-2">
      {/* Filter Options */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-2">
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
                Pending Engineer Approvals
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
                          Travel Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Return Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Approval
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Name
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredPendingData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={13}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-pending"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No pending engineer approvals found.
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
                                onClick={() => handleApprovalClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 transition-all duration-300 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md group"
                                data-testid={`button-approval-${ticket.ticketId}`}
                              >
                                <span className="font-medium">Approval</span>
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
                              {ticket.enquiryType || ""}
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
                            No pending engineer approvals found.
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
                                onClick={() => handleApprovalClick(ticket)}
                                variant="outline"
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 border border-blue-200"
                              >
                                Approval
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

                            {/* Engineer & Enquiry Type */}
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
                                  Enquiry Type
                                </p>
                                <p className="text-blue-900">
                                  {ticket.enquiryType || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Travel Dates */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Travel Date
                                </p>
                                <p className="text-blue-900">
                                  {formatDate(ticket.travelDate) || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Return Date
                                </p>
                                <p className="text-blue-900">
                                  {formatDate(ticket.returnDate) || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Approval Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Approval Status
                                </p>
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {ticket.approvalBy || "Pending"}
                                </span>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Approval Name
                                </p>
                                <p className="text-blue-900">
                                  {ticket.nameDropdown || "N/A"}
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
                Engineer Approval History
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
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Travel Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Return Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Site Visit Date
                        </th>
                        <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">
                          Verification Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredHistoryData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center py-8 bg-white"
                            data-testid="text-no-history"
                          >
                            {fetchLoading ? (
                              <div className="flex justify-center items-center text-blue-700">
                                <LoaderIcon className="animate-spin w-8 h-8" />
                              </div>
                            ) : (
                              <h1 className="text-blue-700">
                                No engineer approval history found.
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
                              {formatDate(ticket.travelDate) || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.returnDate) || ""}
                            </td>
                            <td className="px-4 py-3 text-blue-900">
                              {formatDate(ticket.siteVisitDate) || ""}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {ticket.verificationStatus === "yes"
                                  ? "Verified"
                                  : "Pending"}
                              </span>
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
                            No engineer approval history found.
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

                            {/* Travel Dates */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Travel Date
                                </p>
                                <p className="text-blue-900">
                                  {formatDate(ticket.travelDate) || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Return Date
                                </p>
                                <p className="text-blue-900">
                                  {formatDate(ticket.returnDate) || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Site Visit Date */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Site Visit Date
                              </p>
                              <p className="text-blue-900">
                                {formatDate(ticket.siteVisitDate) || "N/A"}
                              </p>
                            </div>

                            {/* Verification Status */}
                            <div>
                              <p className="text-gray-500 font-medium text-sm">
                                Verification Status
                              </p>
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.verificationStatus === "yes"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {ticket.verificationStatus === "yes"
                                  ? "Verified"
                                  : "Pending"}
                              </span>
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

      {/* Engineer Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Engineer Approval"
        size="2xl"
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
            <Label>Machine Name</Label>
            <Input
              value={formData.machineName || ""}
              disabled
              className="bg-slate-50"
            />
          </div>

          {!isCancelled && (
            <>
              <div>
                <Label>Travel Date</Label>
                <Input
                  value={formData.travelDate || ""}
                  disabled
                  className="bg-slate-50"
                />
              </div>
              <div>
                <Label>Return Date</Label>
                <Input
                  value={formData.returnDate || ""}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              {/* Editable fields */}
              <div>
                <Label>Site Visit Date *</Label>
                <Input
                  type="date"
                  value={formData.siteVisitDate || ""}
                  onChange={(e) =>
                    handleInputChange("siteVisitDate", e.target.value)
                  }
                  data-testid="input-site-visit-date"
                />
              </div>
              <div>
                <Label>OTP Verification *</Label>
                <Input
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={formData.otpVerification || ""}
                  onChange={(e) =>
                    handleInputChange("otpVerification", e.target.value)
                  }
                  data-testid="input-otp"
                />

                <div className="w-full flex justify-center items-center flex-col">
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

              <div className="md:col-span-2 flex space-x-4 pt-4">
                <Button
                  type="submit"
                  data-testid="button-submit-approval"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
                >
                  {isSubmitting && <Loader2Icon className="animate-spin" />}
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApprovalModal(false)}
                  data-testid="button-cancel-approval"
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
