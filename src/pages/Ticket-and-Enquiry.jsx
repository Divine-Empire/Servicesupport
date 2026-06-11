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
import { Modal } from "../components/ui/modal";
import { useToast } from "../hooks/use-toast";
import {
  ClipboardList,
  Loader2Icon,
  LoaderIcon,
  Plus,
  Search,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export default function TicketAndEnquiry() {
  const [pendingData, setPendingData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterData, setMasterData] = useState({});
  const [searchItem, setSearchItem] = useState("");

  // Filter States
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // New Enquiry Form States
  const [showNewEnquiryForm, setShowNewEnquiryForm] = useState(false);
  const [newEnquiryData, setNewEnquiryData] = useState({
    clientType: "New",
    sourceOfEnquiry: "",
    callType: "",
    enquiryReceiverName: "",
    companyName: "",
    clientName: "",
    phoneNumber: "",
    gstAddress: "",
    siteAddress: "",
    gstNo: "",
    machineName: "",
    category: "",
    mentionIssue: "",
    serviceLocation: ""
  });
  const [newFormSelectedMachines, setNewFormSelectedMachines] = useState([]);

  const { toast } = useToast();

  const sheet_url = import.meta.env.VITE_APPS_SCRIPT_API;

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      const response = await fetch(`${sheet_url}?sheet=Ticket_Enquiry`);
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        const allData = json.data.slice(6).map((row, index) => {
          return {
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
            engineerAssign: row[28] || "",
            CREName: row[127] || "",
            planned1: row[9] || "",
            actual1: row[10] || "",
          };
        });

        // Uniqueness check by Ticket ID, keeping the latest one
        const uniqueTicketsMap = new Map();
        allData.forEach((ticket) => {
          if (ticket.ticketId) {
            uniqueTicketsMap.set(ticket.ticketId, ticket);
          }
        });

        const uniqueAllData = Array.from(uniqueTicketsMap.values());

        // Show all tickets in the system
        setPendingData(uniqueAllData);
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
      const response = await fetch(`${sheet_url}?sheet=DROPDOWN`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const headers = result.data[0];
        const structuredData = {};

        headers.forEach((header) => {
          let normalizedHeader = header;
          if (header === "Enquiry-Receiver-Name") normalizedHeader = "Enquiry Receiver Name";
          if (header === "Company-Name") normalizedHeader = "Company Name";
          if (header === "GST-No.") normalizedHeader = "GST No.";
          if (header === "Category") {
            structuredData["Requirement Service Category"] = [];
          }
          structuredData[normalizedHeader] = [];
        });

        result.data.slice(1).forEach((row) => {
          row.forEach((value, index) => {
            const header = headers[index];
            let normalizedHeader = header;
            if (header === "Enquiry-Receiver-Name") normalizedHeader = "Enquiry Receiver Name";
            if (header === "Company-Name") normalizedHeader = "Company Name";
            if (header === "GST-No.") normalizedHeader = "GST No.";

            const stringValue =
              value !== null && value !== undefined ? String(value).trim() : "";
            
            if (structuredData[normalizedHeader]) {
              structuredData[normalizedHeader].push(stringValue);
            }
            if (header === "Category" && structuredData["Requirement Service Category"]) {
              structuredData["Requirement Service Category"].push(stringValue);
            }
          });
        });

        if (!structuredData["Call type"] || structuredData["Call type"].filter(x => x).length === 0) {
          structuredData["Call type"] = ["Incoming", "Outgoing"];
        }

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

  useEffect(() => {
    fetchMasterSheet();
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
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

  const handleNewEnquiryCompanyChange = (value) => {
    setNewEnquiryData((prev) => {
      const updated = { ...prev, companyName: value };
      
      if (prev.clientType === "Existing" && masterData[0]) {
        const companyNames = masterData[0]["Company Name"] || [];
        const gstAddresses = masterData[0]["GST Address"] || [];
        const gstNos = masterData[0]["GST No."] || [];
        
        const index = companyNames.findIndex(
          (name) => name && name.toLowerCase() === value.toLowerCase()
        );
        
        if (index !== -1) {
          updated.gstAddress = gstAddresses[index] || "";
          updated.gstNo = gstNos[index] || "";
        }
      }
      return updated;
    });
  };

  const userName = localStorage.getItem("currentUsername");

  const handleNewEnquirySubmit = async (e) => {
    e.preventDefault();

    if (!newEnquiryData.clientName) {
      alert("Error: Client Name is required");
      return;
    }
    if (!newEnquiryData.phoneNumber) {
      alert("Error: Phone Number is required");
      return;
    }
    if (!newEnquiryData.category) {
      alert("Error: Category is required");
      return;
    }
    if (!newEnquiryData.callType) {
      alert("Error: Call Type is required");
      return;
    }
    if (!newEnquiryData.sourceOfEnquiry) {
      alert("Error: Source of Enquiry is required");
      return;
    }
    if (!newEnquiryData.enquiryReceiverName) {
      alert("Error: Enquiry Receiver Name is required");
      return;
    }
    if (!newEnquiryData.serviceLocation) {
      alert("Error: Service Location is required");
      return;
    }
    if (newEnquiryData.clientType === "Existing" && !newEnquiryData.companyName) {
      alert("Error: Company Name is required for existing clients");
      return;
    }

    setIsSubmitting(true);
    const currentDateTime = formatDateTime(new Date());

    try {
      const rowData = Array(128).fill("");
      rowData[0] = currentDateTime;
      rowData[1] = "";
      rowData[9] = currentDateTime;

      rowData[12] = newEnquiryData.sourceOfEnquiry || "";
      rowData[13] = newEnquiryData.callType || "";
      rowData[14] = newEnquiryData.enquiryReceiverName || "";
      rowData[15] = newEnquiryData.clientType || "";
      rowData[16] = newEnquiryData.companyName || "";
      rowData[17] = newEnquiryData.clientName || "";
      rowData[18] = newEnquiryData.phoneNumber || "";
      rowData[19] = newEnquiryData.gstAddress || "";
      rowData[20] = newEnquiryData.siteAddress || "";
      rowData[21] = newEnquiryData.gstNo || "";
      rowData[22] = newFormSelectedMachines.join(", ");
      rowData[23] = newEnquiryData.category || "";
      rowData[24] = newEnquiryData.mentionIssue || "";
      rowData[25] = newEnquiryData.serviceLocation || "";

      rowData[117] = "No";
      rowData[127] = userName || "";

      const response = await fetch(sheet_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          sheetName: "Ticket_Enquiry",
          action: "insertTicket",
          rowData: JSON.stringify(rowData),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: `Enquiry created successfully with Ticket ID: ${result.ticketId}`,
        });
        setShowNewEnquiryForm(false);
        setNewEnquiryData({
          clientType: "New",
          sourceOfEnquiry: "",
          callType: "",
          enquiryReceiverName: "",
          companyName: "",
          clientName: "",
          phoneNumber: "",
          gstAddress: "",
          siteAddress: "",
          gstNo: "",
          machineName: "",
          category: "",
          mentionIssue: "",
          serviceLocation: ""
        });
        setNewFormSelectedMachines([]);
        fetchData();
      } else {
        throw new Error(result.error || "Failed to create enquiry");
      }
    } catch (error) {
      console.error("Error creating enquiry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create enquiry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleStorage = localStorage.getItem("o2d-auth-storage");
  const parsedData = roleStorage ? JSON.parse(roleStorage) : null;
  const role = parsedData?.state?.user?.role;

  const roleFilteredData = role === "user"
    ? pendingData.filter((item) => item["CREName"] === userName)
    : role === "engineer"
      ? pendingData.filter((item) => item["engineerAssign"] === userName)
      : pendingData;

  const filteredPendingData = roleFilteredData
    .filter((item) => {
      const q = searchItem.toLowerCase();
      const matchesSearch =
        String(item.ticketId || "").toLowerCase().includes(q) ||
        String(item.clientName || "").toLowerCase().includes(q) ||
        String(item.companyName || "").toLowerCase().includes(q) ||
        String(item.phoneNumber || "").toLowerCase().includes(q);
      
      if (!matchesSearch) return false;

      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      if (item.timeStemp) {
        let ticketDateObj = null;
        if (typeof item.timeStemp === "string" && item.timeStemp.includes("/")) {
          const datePart = item.timeStemp.split(" ")[0];
          const parts = datePart.split("/");
          if (parts.length === 3) {
            ticketDateObj = new Date(parts[2], parts[1] - 1, parts[0]);
          }
        } else {
          ticketDateObj = new Date(item.timeStemp);
        }

        if (ticketDateObj && !isNaN(ticketDateObj.getTime())) {
          ticketDateObj.setHours(0, 0, 0, 0);

          if (dateRange.start) {
            const fromDateObj = new Date(dateRange.start);
            fromDateObj.setHours(0, 0, 0, 0);
            if (ticketDateObj < fromDateObj) return false;
          }

          if (dateRange.end) {
            const toDateObj = new Date(dateRange.end);
            toDateObj.setHours(23, 59, 59, 999);
            if (ticketDateObj > toDateObj) return false;
          }
        }
      } else if (dateRange.start || dateRange.end) {
        return false;
      }
      return true;
    })
    .reverse();

  // Categories filter dropdown dynamically computes from the current table items
  const availableCategories = [
    ...new Set(roleFilteredData.map((item) => item.category).filter(Boolean)),
  ];

  return (
    <div className="space-y-2">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-t-lg border-b border-blue-100 px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-blue-900 text-xl font-bold flex items-center gap-2">
              All Tickets
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {filteredPendingData?.length}
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                placeholder="Search Ticket, Client..."
                className="pl-9 bg-white border-blue-200 shadow-sm w-full h-9 text-sm"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDateModalOpen(true)}
              className={`border-blue-200 text-blue-700 hover:bg-blue-50 whitespace-nowrap h-9 bg-white shadow-sm ${(dateRange.start || dateRange.end) ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200" : ""}`}
            >
              <Calendar className="mr-2 h-4 w-4 text-blue-500" />
              {(dateRange.start || dateRange.end) ? (
                <span className="text-xs font-semibold text-blue-700">
                  {dateRange.start && dateRange.end
                    ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
                    : (dateRange.start ? `From ${formatDate(dateRange.start)}` : `To ${formatDate(dateRange.end)}`)}
                </span>
              ) : "Date Range"}
            </Button>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white border-blue-200 shadow-sm w-full sm:w-[150px] h-9 text-sm text-blue-800">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchItem || categoryFilter !== "all" || dateRange.start || dateRange.end) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchItem("");
                  setCategoryFilter("all");
                  setDateRange({ start: "", end: "" });
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 h-9 min-w-fit"
                title="Clear All Filters"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}

            <Button
              onClick={() => setShowNewEnquiryForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-sm transition-all duration-300 rounded-lg px-4 py-2 flex items-center gap-1.5 group shrink-0 h-9"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              New Enquiry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <div className="max-h-[calc(100vh-321px)] overflow-y-auto">
              <table className="hidden sm:block w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Date</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Ticket-ID</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">Source of enquiry</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Call type</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">Enquiry Receiver Name</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[120px] sticky top-0">Client Type</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">Company Name</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Client Name</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Phone Number</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">GST Address</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[200px] sticky top-0">Site Address</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">GST No.</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[180px] sticky top-0">Machine Name</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Category</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[250px] sticky top-0">Mention Issue</th>
                    <th className="text-white border-b border-blue-500 px-4 py-3 text-left w-[150px] sticky top-0">Service Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {filteredPendingData.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="text-center py-8 bg-white">
                        {fetchLoading ? (
                          <div className="flex justify-center items-center text-blue-700">
                            <LoaderIcon className="animate-spin w-8 h-8" />
                          </div>
                        ) : (
                          <h1 className="text-blue-700">No enquiries found.</h1>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredPendingData.map((ticket, ind) => (
                      <tr key={ind} className={ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"}>
                        <td className="px-4 py-3 text-blue-900">{formatDate(ticket.timeStemp)}</td>
                        <td className="px-4 py-3 text-blue-900 font-semibold">{ticket.ticketId}</td>
                        <td className="px-4 py-3 text-blue-900">{ticket.sourceOfEnquiry}</td>
                        <td className="px-4 py-3 text-blue-900">{ticket.callType}</td>
                        <td className="px-4 py-3 text-blue-900">{ticket.enquiryReceiverName}</td>
                        <td className="px-4 py-3 text-blue-900">{ticket.clientType}</td>
                        <td className="px-4 py-3 text-blue-900">{ticket.companyName}</td>
                        <td className="px-4 py-3 text-blue-900">{ticket.clientName}</td>
                        <td className="px-4 py-3 text-blue-900">{ticket.phoneNumber}</td>
                        <td className="px-4 py-3 text-blue-900 truncate max-w-xs hover:whitespace-normal">{ticket.gstAddress}</td>
                        <td className="px-4 py-3 text-blue-900 truncate max-w-xs hover:whitespace-normal">{ticket.siteAddress}</td>
                        <td className="px-4 py-3 text-blue-900">{ticket.gstNo}</td>
                        <td className="px-4 py-3 text-blue-900 truncate max-w-xs hover:whitespace-normal">{ticket.machineName}</td>
                        <td className="px-4 py-3 text-blue-900">{ticket.category}</td>
                        <td className="px-4 py-3 text-blue-900 max-w-xs truncate hover:whitespace-normal">{ticket.mentionIssue}</td>
                        <td className="px-4 py-3 text-blue-900">{ticket.serviceLocation}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="sm:hidden space-y-4">
                {filteredPendingData.length === 0 ? (
                  <div className="text-center py-8 bg-white">
                    {fetchLoading ? (
                      <div className="flex justify-center items-center text-blue-700">
                        <LoaderIcon className="animate-spin w-8 h-8" />
                      </div>
                    ) : (
                      <h1 className="text-blue-700">No enquiries found.</h1>
                    )}
                  </div>
                ) : (
                  filteredPendingData.map((ticket, ind) => (
                    <Card key={ind} className={`border-l-4 border-l-blue-500 ${ind % 2 === 0 ? "bg-blue-50/50" : "bg-white"}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {ticket.ticketId}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(ticket.timeStemp)}
                              </span>
                            </div>
                            <h3 className="font-bold text-blue-800 text-lg mt-1">{ticket.companyName || "No Company"}</h3>
                            <p className="text-sm text-gray-600">{ticket.clientName}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 font-medium">Source of Enquiry</p>
                            <p className="text-blue-900">{ticket.sourceOfEnquiry}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Call Type</p>
                            <p className="text-blue-900">{ticket.callType}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Enquiry Receiver Name</p>
                            <p className="text-blue-900">{ticket.enquiryReceiverName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Client Type</p>
                            <p className="text-blue-900">{ticket.clientType}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Phone Number</p>
                            <p className="text-blue-900">{ticket.phoneNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Category</p>
                            <p className="text-blue-900">{ticket.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Service Location</p>
                            <p className="text-blue-900">{ticket.serviceLocation}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">GST No.</p>
                            <p className="text-blue-900">{ticket.gstNo}</p>
                          </div>
                        </div>

                        <div className="text-sm space-y-1">
                          <p className="text-gray-500 font-medium">GST Address</p>
                          <p className="text-blue-900">{ticket.gstAddress}</p>
                        </div>

                        <div className="text-sm space-y-1">
                          <p className="text-gray-500 font-medium">Site Address</p>
                          <p className="text-blue-900">{ticket.siteAddress}</p>
                        </div>

                        <div className="text-sm space-y-1">
                          <p className="text-gray-500 font-medium">Machine Name</p>
                          <p className="text-blue-900">{ticket.machineName}</p>
                        </div>

                        <div className="text-sm space-y-1">
                          <p className="text-gray-500 font-medium">Mention Issue</p>
                          <p className="text-blue-900">{ticket.mentionIssue}</p>
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

      <Modal
        isOpen={showNewEnquiryForm}
        onClose={() => setShowNewEnquiryForm(false)}
        title={
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <span>New Enquiry</span>
          </div>
        }
        size="4xl"
        className="rounded-lg max-h-[90vh] overflow-y-auto"
      >
        <form
          onSubmit={handleNewEnquirySubmit}
          className="space-y-6 max-h-[70vh] overflow-y-auto p-2"
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gray-50 px-4 py-3">
              <CardTitle className="text-sm font-medium flex items-center bg-transparent border-0 shadow-none text-gray-800">
                Client Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm">Client Type *</Label>
                <Select
                  onValueChange={(value) => {
                    setNewEnquiryData(prev => ({
                      ...prev,
                      clientType: value,
                      companyName: value === "New" ? "" : prev.companyName,
                      gstAddress: value === "New" ? "" : prev.gstAddress,
                      gstNo: value === "New" ? "" : prev.gstNo
                    }));
                  }}
                  value={newEnquiryData.clientType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Client Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Existing">Existing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Company Name *</Label>
                {newEnquiryData.clientType === "Existing" ? (
                  <div className="relative">
                    <Input
                      value={newEnquiryData.companyName || ""}
                      onChange={(e) => handleNewEnquiryCompanyChange(e.target.value)}
                      placeholder="Type to search or select company name"
                      list="new-company-suggestions"
                    />
                    <datalist id="new-company-suggestions">
                      {(masterData[0]?.["Company Name"] || [])
                        .filter((name, index, self) => name && self.indexOf(name) === index)
                        .map((name, index) => (
                          <option key={index} value={name} />
                        ))}
                    </datalist>
                  </div>
                ) : (
                  <Input
                    value={newEnquiryData.companyName || ""}
                    onChange={(e) => setNewEnquiryData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name"
                  />
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Client Name *</Label>
                <Input
                  value={newEnquiryData.clientName || ""}
                  onChange={(e) => setNewEnquiryData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Enter client name"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Phone Number *</Label>
                <Input
                  value={newEnquiryData.phoneNumber || ""}
                  onChange={(e) => setNewEnquiryData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gray-50 px-4 py-3">
              <CardTitle className="text-sm font-medium flex items-center bg-transparent border-0 shadow-none text-gray-800">
                Enquiry Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm">Call Type *</Label>
                <Select
                  onValueChange={(value) => setNewEnquiryData(prev => ({ ...prev, callType: value }))}
                  value={newEnquiryData.callType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Call Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                    {(masterData[0]?.["Call type"] || [])
                      .filter(Boolean)
                      .map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Source of Enquiry *</Label>
                <div className="relative">
                  <Input
                    value={newEnquiryData.sourceOfEnquiry || ""}
                    onChange={(e) => setNewEnquiryData(prev => ({ ...prev, sourceOfEnquiry: e.target.value }))}
                    placeholder="Search or enter source"
                    list="new-source-suggestions"
                  />
                  <datalist id="new-source-suggestions">
                    {(masterData[0]?.["Source of enquiry"] || [])
                      .filter((name, index, self) => name && self.indexOf(name) === index)
                      .map((name, index) => (
                        <option key={index} value={name} />
                      ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Enquiry Receiver Name *</Label>
                <div className="relative">
                  <Input
                    value={newEnquiryData.enquiryReceiverName || ""}
                    onChange={(e) => setNewEnquiryData(prev => ({ ...prev, enquiryReceiverName: e.target.value }))}
                    placeholder="Search or enter receiver name"
                    list="new-receiver-suggestions"
                  />
                  <datalist id="new-receiver-suggestions">
                    {(masterData[0]?.["Enquiry Receiver Name"] || [])
                      .filter((name, index, self) => name && self.indexOf(name) === index)
                      .map((name, index) => (
                        <option key={index} value={name} />
                      ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Category *</Label>
                <Select
                  onValueChange={(value) => setNewEnquiryData(prev => ({ ...prev, category: value }))}
                  value={newEnquiryData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                    {[...new Set(masterData[0]?.["Requirement Service Category"] || [])]
                      .filter(Boolean)
                      .map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">GST Address</Label>
                <Input
                  value={newEnquiryData.gstAddress || ""}
                  onChange={(e) => setNewEnquiryData(prev => ({ ...prev, gstAddress: e.target.value }))}
                  placeholder="Enter GST Address"
                  disabled={newEnquiryData.clientType === "Existing" && newEnquiryData.companyName !== ""}
                  className={newEnquiryData.clientType === "Existing" && newEnquiryData.companyName !== "" ? "bg-gray-100" : ""}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">GST No.</Label>
                <Input
                  value={newEnquiryData.gstNo || ""}
                  onChange={(e) => setNewEnquiryData(prev => ({ ...prev, gstNo: e.target.value }))}
                  placeholder="Enter GST No."
                  disabled={newEnquiryData.clientType === "Existing" && newEnquiryData.companyName !== ""}
                  className={newEnquiryData.clientType === "Existing" && newEnquiryData.companyName !== "" ? "bg-gray-100" : ""}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Site Address</Label>
                <Input
                  value={newEnquiryData.siteAddress || ""}
                  onChange={(e) => setNewEnquiryData(prev => ({ ...prev, siteAddress: e.target.value }))}
                  placeholder="Enter Site Address"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Service Location *</Label>
                <Select
                  onValueChange={(value) => setNewEnquiryData(prev => ({ ...prev, serviceLocation: value }))}
                  value={newEnquiryData.serviceLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Service Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                    {[...new Set(masterData[0]?.["Service Location"] || [])]
                      .filter(Boolean)
                      .map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label className="text-sm">Machine Name</Label>
                <Select
                  onValueChange={(value) => {
                    if (!newFormSelectedMachines.includes(value)) {
                      setNewFormSelectedMachines(prev => [...prev, value]);
                    }
                  }}
                  value=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine(s)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                    {[...new Set(masterData[0]?.["Machine Name"] || [])]
                      .filter(Boolean)
                      .map((option) => (
                        <SelectItem
                          key={option}
                          value={option}
                          disabled={newFormSelectedMachines.includes(option)}
                        >
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {newFormSelectedMachines.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newFormSelectedMachines.map((machine) => (
                      <div
                        key={machine}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
                      >
                        {machine}
                        <button
                          type="button"
                          onClick={() => {
                            setNewFormSelectedMachines(prev => prev.filter(m => m !== machine));
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label className="text-sm">Mention Issue</Label>
                <Textarea
                  value={newEnquiryData.mentionIssue || ""}
                  onChange={(e) => setNewEnquiryData(prev => ({ ...prev, mentionIssue: e.target.value }))}
                  placeholder="Describe the issue"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              onClick={() => setShowNewEnquiryForm(false)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
              )}
              Create Enquiry
            </Button>
          </div>
        </form>
      </Modal>

      <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-blue-100">
          <DialogHeader>
            <DialogTitle className="text-blue-800 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Filter by Date Range
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="start" className="text-blue-700 font-medium">Start Date</Label>
              <Input
                id="start"
                type="date"
                className="border-blue-200 focus:ring-blue-500"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end" className="text-blue-700 font-medium">End Date</Label>
              <Input
                id="end"
                type="date"
                className="border-blue-200 focus:ring-blue-500"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-between gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setDateRange({ start: "", end: "" })}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Reset Range
            </Button>
            <Button
              onClick={() => setIsDateModalOpen(false)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md px-8"
            >
              Apply Filter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
