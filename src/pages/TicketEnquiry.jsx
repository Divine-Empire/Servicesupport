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
import { LoaderIcon, Plus } from "lucide-react";
import { storage } from "../lib/storage";
import { useToast } from "../hooks/use-toast";

const TicketEnquiry = () => {
  const [showForm, setShowForm] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [masterData, setMasterData] = useState({});
  const [categories, setCategories] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);

  // const [activeTab, setActiveTab] = useState("ticket");

  const [formData, setFormData] = useState({
    clientName: "",
    phoneNumber: "",
    emailAddress: "",
    category: "",
    priority: "",
    title: "",
    description: "",
    personName: "", // Person Name field
  });
  const { toast } = useToast();

  const sheet_url =
    "https://script.google.com/macros/s/AKfycbzsDuvTz21Qx8fAP3MthQdRanIKnFFScPf-SRYp40CqYfKmO4CImMH7-_cVQjMqCsBD/exec";

  const fetchTickets = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${sheet_url}?sheet=Ticket_Enquiry`);
      const data = await response.json();
      // console.log("Raw data from backend:", data);

      if (data.success && data.data && data.data.length > 1) {
        const headerRowIndex = data.data.findIndex(
          (row) => row[0] === "Timestamp"
        );

        if (headerRowIndex === -1) {
          throw new Error("Could not find header row in data");
        }

        const headers = data.data[headerRowIndex];
        const rows = data.data
          .slice(headerRowIndex + 1)
          .filter((row) => row[0]);

        const formattedTickets = rows.map((row) => {
          const ticket = {};
          headers.forEach((header, index) => {
            if (header) {
              ticket[header] = row[index] || "";
            }
          });
          ticket["ColumnAData"] = row[0] || "";
          return ticket;
        });

        console.log("formattedTickets", formattedTickets);

        setTickets(formattedTickets);
      } else {
        toast({
          title: "error",
          description: "something went wrong",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Warning",
        description: "Couldn't connect to server. Using local data.",
        variant: "default",
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
        const columnAData = result.data
          .slice(1)
          .map((row) => row[0])
          .filter((item) => item && item.trim() !== "")
          .filter((item, index, self) => self.indexOf(item) === index);

        // console.log("Categories from Master sheet:", columnAData);
        setCategories(columnAData);

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

        // console.log("Structured Master Data:", structuredData);
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

  const fetchEmployeeNames = async () => {
    try {
      const response = await fetch(`${sheet_url}?sheet=Employee Name`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const employeeData = result.data
          .slice(1) // Skip header row
          .map((row) => row[0]) // Get column A data
          .filter((item) => item && item.trim() !== "")
          .filter((item, index, self) => self.indexOf(item) === index);

        // console.log("Employee names from Employee Name sheet:", employeeData);
        setEmployeeNames(employeeData);
      }
    } catch (error) {
      console.error("Error fetching employee names:", error);
      toast({
        title: "Error",
        description: "Failed to load employee names",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchMasterSheet();
    fetchEmployeeNames();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Updated validation to include personName
    if (
      !formData.clientName ||
      !formData.phoneNumber ||
      !formData.title ||
      !formData.category ||
      !formData.priority ||
      !formData.description ||
      !formData.personName
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const headersResponse = await fetch(`${sheet_url}?sheet=Ticket_Enquiry`);
      const headersData = await headersResponse.json();

      if (!headersData.success || !headersData.data) {
        throw new Error("Could not fetch headers");
      }

      const headerRowIndex = headersData.data.findIndex(
        (row) => row[0] === "Timestamp"
      );

      if (headerRowIndex === -1) {
        throw new Error("Could not find header row in data");
      }

      const headers = headersData.data[headerRowIndex];

      const newTicket = {
        Timestamp: formatDateTime(new Date()),
        "Ticket ID": "", // Backend will generate this
        "Client Name": formData.clientName,
        "Phone Number": formData.phoneNumber,
        "Email Address": formData.emailAddress,
        Category: formData.category,
        Priority: formData.priority,
        Title: formData.title,
        Description: formData.description,
        "Person Name": formData.personName, // Person Name goes to column DM
        ColumnAData: formatDateTime(new Date()),
      };

      const rowData = headers.map((header) => {
        return newTicket[header] || "";
      });

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
        // Fixed: Ensure ticket ID is properly formatted
        const ticketId = result.ticketId || result.ticket_id || "";
        newTicket["Ticket ID"] = String(ticketId); // Ensure it's a string

        setTickets([...tickets, newTicket]);

        // Reset form including personName
        setFormData({
          clientName: "",
          phoneNumber: "",
          emailAddress: "",
          category: "",
          priority: "",
          title: "",
          description: "",
          personName: "", // Reset Person Name field
        });

        toast({
          title: "Success",
          description: `Ticket ${ticketId} created successfully`,
        });
      } else {
        throw new Error(result.error || "Failed to save ticket");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to save ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowForm(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: "bg-red-500/20 text-red-700 border border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30",
      low: "bg-green-500/20 text-green-700 border border-green-500/30",
    };
    return badges[priority?.toLowerCase()] || badges.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    if (typeof dateString === "string" && dateString.includes("/")) {
      const parts = dateString.split(" ")[0].split("/");
      if (parts.length === 3) {
        return parts.join("/");
      }
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
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

  // console.log("tickets",tickets);

  const filteredTickets = tickets;
  // activeTab === "cancel"
  //   ? tickets.filter((ticket) => ticket["Status"] === "Cancelled")
  //   : tickets.filter((ticket) => ticket["Status"] !== "Cancelled");

  const getRowColor = (ticket) => {
    if (ticket["Status"] === "Cancelled") {
      return "bg-red-100"; // Red for cancelled
    }
    if (ticket["Close Status"] === "Closed") {
      return "bg-green-100"; // Blue for closed
    }
    return ""; // Default color for running or empty
  };

  return (
    <div className="space-y-2">
      {/* Create Ticket Card */}
      <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-800">Create New Ticket</CardTitle>
            <Button
              onClick={() => setShowForm(true)}
              data-testid="button-new-ticket"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </CardHeader>
      </Card>

      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-blue-800">
            All Tickets
          </CardTitle>
          {/* <div className="flex space-x-2">
            <Button
              variant={activeTab === "ticket" ? "default" : "outline"}
              onClick={() => setActiveTab("ticket")}
              className={activeTab === "ticket" ? "bg-blue-600 text-white" : ""}
            >
              Ticket
            </Button>
            <Button
              variant={activeTab === "cancel" ? "default" : "outline"}
              onClick={() => setActiveTab("cancel")}
              className={activeTab === "cancel" ? "bg-blue-600 text-white" : ""}
            >
              Cancel
            </Button>
          </div> */}
        </div>
      </CardHeader>

      {/* Pop-up Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-blue-200">
            <Card className="border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle>Create New Ticket</CardTitle>
                  <button
                    onClick={() => !isSubmitting && setShowForm(false)}
                    className="text-white/80 hover:text-white"
                    disabled={isSubmitting}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="clientName" className="text-blue-800">
                      Client Name *
                    </Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) =>
                        handleInputChange("clientName", e.target.value)
                      }
                      required
                      disabled={isSubmitting}
                      placeholder="Enter Client Name..."
                      data-testid="input-client-name"
                      className="border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-blue-800">
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      placeholder="Enter phone numbere..."
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      required
                      disabled={isSubmitting}
                      data-testid="input-phone-number"
                      className="border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailAddress" className="text-blue-800">
                      Email Address
                    </Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={formData.emailAddress}
                      onChange={(e) =>
                        handleInputChange("emailAddress", e.target.value)
                      }
                      required
                      disabled={isSubmitting}
                      placeholder="Enter Your Email..."
                      data-testid="input-email-address"
                      className="border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Employee Name Dropdown Field */}
                  <div className="space-y-2">
                    <Label htmlFor="personName" className="text-blue-800">
                      Employee Name *
                    </Label>
                    <Select
                      value={formData.personName}
                      onValueChange={(value) =>
                        handleInputChange("personName", value)
                      }
                      disabled={isSubmitting}
                      required
                    >
                      <SelectTrigger
                        data-testid="select-employee-name"
                        className="bg-white border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <SelectValue placeholder="Select employee name" />
                      </SelectTrigger>
                      <SelectContent
                        className="bg-white border border-blue-200 shadow-lg rounded-md z-[60] max-h-[200px] overflow-y-auto"
                        position="popper"
                        sideOffset={4}
                      >
                        {employeeNames.length > 0 ? (
                          employeeNames.map((employeeName, index) => (
                            <SelectItem
                              key={index}
                              value={employeeName}
                              className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-2 text-sm"
                            >
                              {employeeName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            Loading employee names...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-blue-800">
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                      disabled={isSubmitting}
                      required
                    >
                      <SelectTrigger
                        data-testid="select-category"
                        className="bg-white border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent
                        className="bg-white border border-blue-200 shadow-lg rounded-md z-[60] max-h-[200px] overflow-y-auto"
                        position="popper"
                        sideOffset={4}
                      >
                        {categories.length > 0 ? (
                          categories.map((category, index) => (
                            <SelectItem
                              key={index}
                              value={category}
                              className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-2 text-sm"
                            >
                              {category}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-blue-800">
                      Priority *
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        handleInputChange("priority", value)
                      }
                      disabled={isSubmitting}
                      required
                    >
                      <SelectTrigger
                        data-testid="select-priority"
                        className="bg-white border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent
                        className="bg-white border border-blue-200 shadow-lg rounded-md z-[60]"
                        position="popper"
                        sideOffset={4}
                      >
                        <SelectItem
                          value="high"
                          className="hover:bg-red-50 focus:bg-red-50 cursor-pointer px-3 py-2 text-sm text-red-700"
                        >
                          High
                        </SelectItem>
                        <SelectItem
                          value="medium"
                          className="hover:bg-yellow-50 focus:bg-yellow-50 cursor-pointer px-3 py-2 text-sm text-yellow-700"
                        >
                          Medium
                        </SelectItem>
                        <SelectItem
                          value="low"
                          className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2 text-sm text-green-700"
                        >
                          Low
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title" className="text-blue-800">
                      Company Name *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      required
                      disabled={isSubmitting}
                      placeholder="Enter Company Name..."
                      data-testid="input-title"
                      className="border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description" className="text-blue-800">
                      Description*
                    </Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      required
                      disabled={isSubmitting}
                      placeholder="Enter Description..."
                      data-testid="textarea-description"
                      className="border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2 flex space-x-4 pt-2">
                    <Button
                      type="submit"
                      data-testid="button-submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      data-testid="button-cancel"
                      disabled={isSubmitting}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tickets Table - FIXED: Fully Scrollable with Header */}
      <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
        <CardHeader>
          {/* <CardTitle className="text-blue-800">All Tickets</CardTitle> */}
        </CardHeader>
        <CardContent>
          {/* FIXED: Single scrollable container with both header and body */}
          <div className="overflow-auto max-h-[70vh] border border-gray-200 rounded-lg">
            <Table className="min-w-full">
              <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="text-white border-b border-blue-500 min-w-[120px] px-4 py-3">
                    Ticket ID
                  </TableHead>

                  {/* {activeTab === "cancel" && (
                    <>
                      <TableHead className="text-white border-b border-blue-500 min-w-[150px] px-4 py-3">
                        Stage Name
                      </TableHead>
                      <TableHead className="text-white border-b border-blue-500 min-w-[150px] px-4 py-3">
                        Remarks
                      </TableHead>
                    </>
                  )} */}

                  <TableHead className="text-white border-b border-blue-500 min-w-[150px] px-4 py-3">
                    Client Name
                  </TableHead>
                  <TableHead className="text-white border-b border-blue-500 min-w-[150px] px-4 py-3">
                    Employee Name
                  </TableHead>
                  <TableHead className="text-white border-b border-blue-500 min-w-[150px] px-4 py-3">
                    Phone Number
                  </TableHead>
                  <TableHead className="text-white border-b border-blue-500 min-w-[200px] px-4 py-3">
                    Email Address
                  </TableHead>
                  <TableHead className="text-white border-b border-blue-500 min-w-[200px] px-4 py-3">
                    Delay In Hr
                  </TableHead>
                  <TableHead className="text-white border-b border-blue-500 min-w-[150px] px-4 py-3">
                    Category
                  </TableHead>
                  <TableHead className="text-white border-b border-blue-500 min-w-[120px] px-4 py-3">
                    Priority
                  </TableHead>
                  <TableHead className="text-white border-b border-blue-500 min-w-[150px] px-4 py-3">
                    Company Name
                  </TableHead>
                  <TableHead className="text-white border-b border-blue-500 min-w-[250px] px-4 py-3">
                    Description
                  </TableHead>
                  <TableHead className="text-white border-b border-blue-500 min-w-[120px] px-4 py-3">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-blue-100">
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 bg-white"
                      data-testid="text-no-tickets"
                    >
                      {fetchLoading ? (
                        <div className="flex justify-center items-center text-blue-700">
                          <LoaderIcon className="animate-spin h-6 w-6" />
                          <span className="ml-2">Loading tickets...</span>
                        </div>
                      ) : (
                        <h1 className="text-blue-700">
                          No tickets found. Create your first ticket to get
                          started.
                        </h1>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  [...filteredTickets].reverse().map((ticket, index) => (
                    // <TableRow
                    //   key={index}
                    //   className={index % 2 === 0 ? "bg-blue-50/50" : "bg-white"}
                    // >

                    <TableRow
                      key={index}
                      className={
                        getRowColor(ticket) ||
                        (index % 2 === 0 ? "bg-blue-50/50" : "bg-white")
                      }
                    >
                      <TableCell
                        className="font-medium text-blue-800 px-4 py-3"
                        data-testid={`text-ticket-id-${ticket["Ticket ID"]}`}
                      >
                        {/* FIXED: Ensure Ticket ID is properly displayed */}
                        {String(
                          ticket["Ticket ID"] || ticket["ticket_id"] || ""
                        )}
                      </TableCell>

                      {/* {activeTab === "cancel" && (
                        <>
                          <TableCell className="text-blue-900 px-4 py-3">
                            {ticket["Stage Name"]}
                          </TableCell>
                          <TableCell className="text-blue-900 px-4 py-3">
                            {ticket["Remarks"]}
                          </TableCell>
                        </>
                      )} */}

                      <TableCell className="text-blue-900 px-4 py-3">
                        {ticket["Client Name"]}
                      </TableCell>
                      <TableCell className="text-blue-900 px-4 py-3">
                        {ticket["Person Name"]}
                      </TableCell>
                      <TableCell className="text-blue-900 px-4 py-3">
                        {ticket["Phone Number"]}
                      </TableCell>
                      <TableCell className="text-blue-900 px-4 py-3">
                        {ticket["Email Address"]}
                      </TableCell>
                      <TableCell className="text-red-900 px-4 py-3">
                        {Math.round(ticket["Delay1"]*24)}
                      </TableCell>
                      <TableCell className="text-blue-900 px-4 py-3">
                        {ticket["Category"]}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(
                            ticket["Priority"]
                          )}`}
                        >
                          {ticket["Priority"]}
                        </span>
                      </TableCell>
                      <TableCell className="text-blue-900 px-4 py-3">
                        {ticket["Title"]}
                      </TableCell>
                      <TableCell className="text-blue-900 px-4 py-3 max-w-xs">
                        <div className="truncate hover:whitespace-normal hover:overflow-visible">
                          {ticket["Description"]}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-900 px-4 py-3">
                        {formatDate(ticket["ColumnAData"])}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketEnquiry;
