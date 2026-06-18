import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { LoaderIcon, Plus, Search, Calendar, Filter, Clock, CheckCircle2, MoreHorizontal, ExternalLink } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const formatDateTime = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const formatDateOnly = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatInputDate = (dateStr) => {
  if (!dateStr) return "";
  const str = String(dateStr).trim().split(" ")[0];
  
  // Case 1: Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  
  // Case 2: DD-MM-YYYY or DD/MM/YYYY
  const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    let year = match[3];
    if (year.length === 2) {
      year = "20" + year;
    }
    return `${year}-${month}-${day}`;
  }

  // Case 3: YYYY/MM/DD
  const matchY = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (matchY) {
    const year = matchY[1];
    const month = matchY[2].padStart(2, "0");
    const day = matchY[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  
  // Fallback to JS Date parser (local components to avoid timezone shifts)
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (e) {}
  
  return "";
};

const ServiceInstallation = () => {
  const [installations, setInstallations] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [approvalData, setApprovalData] = useState({
    clientStatus: "Yes",
    actualDate: "",
    serviceType: "",
    engineerName: "",
    remarks: "",
    followUpDate: "",
    customerSay: "",
  });

  const { toast } = useToast();
  const [employeeNames, setEmployeeNames] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceTypeSearch, setServiceTypeSearch] = useState("");
  const [engineerSearch, setEngineerSearch] = useState("");
  const [fileData, setFileData] = useState({ name: "", base64: "" });
  const fileInputRef = useRef(null);

  const sheet_url = import.meta.env.VITE_APPS_SCRIPT_API;
  const Sheet_Id = import.meta.env.VITE_GOOGLE_SHEET_ID;
  const Folder_Id = import.meta.env.VITE_SERVICE_INSTALLATION_FOLDER_ID;

  const fetchInstallations = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${sheet_url}?sheetId=${Sheet_Id}&sheet=Service-Installation`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const headerRowIndex = result.data.findIndex(row => row[0] === "Timestamp");
        if (headerRowIndex === -1) throw new Error("Header row not found");

        const headers = result.data[headerRowIndex];
        const rows = result.data.slice(headerRowIndex + 1);

        const formattedData = rows
          .filter(row => row[0])
          .map((row, index) => {
            const item = {};
            headers.forEach((header, index) => {
              item[header] = row[index] || "";
            });
            item._planned1 = row[14] || ""; // Column O
            item._actual1 = row[15] || "";  // Column P
            item["INVOICE DATE"] = row[10] || ""; // Column K
            item["Invoice Copy"] = row[12] || ""; // Column M
            item._rowIndex = headerRowIndex + index + 2; // For update logic
            return item;
          });

        setInstallations(formattedData);
      }
    } catch (error) {
      console.error("Error fetching installations:", error);
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const response = await fetch(`${sheet_url}?sheetId=${Sheet_Id}&sheet=DROPDOWN`);
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        const headers = result.data[0];
        
        let engineerIdx = headers.indexOf("Engineer Assign Name");
        if (engineerIdx === -1) engineerIdx = 94; // fallback CQ (index 94)
        
        let serviceIdx = headers.indexOf("Installation/Service");
        if (serviceIdx === -1) serviceIdx = 96; // fallback CS (index 96)

        const engineers = result.data.slice(1).map(row => row[engineerIdx]).filter(Boolean);
        const services = result.data.slice(1).map(row => row[serviceIdx]).filter(Boolean);

        setEmployeeNames([...new Set(engineers)]);
        setServiceTypes([...new Set(services)]);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  useEffect(() => {
    fetchInstallations();
    fetchDropdownData();
  }, []);

  const handleApproveClick = (item) => {
    setSelectedItem(item);
    setApprovalData({
      clientStatus: "",
      actualDate: formatDateTime(new Date()),
      serviceType: "",
      engineerName: "",
      remarks: "",
      followUpDate: "",
      customerSay: "",
    });
    setFileData({ name: "", base64: "" });
    setShowApprovalDialog(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Error", description: "File size exceeds 10MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFileData({
          name: file.name,
          base64: reader.result.split(",")[1]
        });
        toast({ title: "File Selected", description: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      let finalFileUrl = "";

      // Step 1: Upload File if exists
      if (fileData.base64) {
        const uploadParams = new URLSearchParams({
          action: "uploadFile",
          base64Data: fileData.base64,
          fileName: fileData.name,
          mimeType: fileData.name.toLowerCase().endsWith(".pdf") ? "application/pdf" :
            fileData.name.toLowerCase().endsWith(".mp4") ? "video/mp4" : "image/jpeg",
          folderId: Folder_Id
        });

        const uploadResponse = await fetch(sheet_url, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: uploadParams.toString(),
        });

        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          finalFileUrl = uploadResult.fileUrl;
        } else {
          throw new Error("File upload failed: " + uploadResult.error);
        }
      }

      // Step 2: Prepare column data
      const columnData = {
        R: approvalData.clientStatus, // Client Status
      };

      if (approvalData.clientStatus === "Yes") {
        columnData.P = approvalData.actualDate; // Actual 1
        columnData.S = approvalData.serviceType; // Installation/Service
        columnData.T = approvalData.engineerName; // Engineer Name
        columnData.U = finalFileUrl; // Service Video Upload (URL)
        columnData.W = approvalData.remarks; // What Did Customer's Say (Remarks) (Column W instead of X)
      } else if (approvalData.clientStatus === "No") {
        columnData.W = approvalData.remarks; // What Did Customer's Say (Remarks) (Column W instead of X)
      } else if (approvalData.clientStatus === "Next Date for Follow-Up") {
        columnData.V = approvalData.followUpDate; // Next Date
        columnData.W = approvalData.customerSay; // What Did Customer's Say
      }

      // Step 3: Update Sheet
      const updateParams = new URLSearchParams({
        sheetId: Sheet_Id,
        sheetName: "Service-Installation",
        action: "update",
        rowIndex: selectedItem._rowIndex.toString(),
        columnData: JSON.stringify(columnData),
      });

      const response = await fetch(sheet_url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: updateParams.toString(),
      });

      const result = await response.json();
      if (result.success) {
        toast({ title: "Success", description: "Installation updated successfully" });
        setShowApprovalDialog(false);
        fetchInstallations(); // Refresh data
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (error) {
      console.error("Error updating installation:", error);
      toast({ title: "Error", description: error.message || "Failed to update record", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };



  const filteredData = installations.filter(item => {
    const matchesSearch = searchTerm === "" ||
      Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    if (selectedDateFilter !== "") {
      const itemDateNormalized = formatInputDate(item["Next Date"]);
      if (itemDateNormalized !== selectedDateFilter) return false;
    }

    if (activeTab === "pending") {
      return item._planned1 !== "" && item._actual1 === "";
    } else {
      return item._planned1 !== "" && item._actual1 !== "";
    }
  });

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("approved") || s.includes("complete")) return "bg-green-500/20 text-green-700 border border-green-500/30";
    if (s.includes("reject") || s.includes("cancel")) return "bg-red-500/20 text-red-700 border border-red-500/30";
    return "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30";
  };

  const serviceTypeClean = (approvalData.serviceType || "").trim().toLowerCase();
  const showEngineer = serviceTypeClean === "site visit" || serviceTypeClean === "video-call";
  const showServiceReport = serviceTypeClean === "site visit";

  return (
    <div className="space-y-6">
      <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-indigo-900">Service Installation</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-start sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                <Input
                  placeholder="Search installations..."
                  className="pl-10 border-indigo-100 focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Label className="text-xs font-bold text-indigo-600 whitespace-nowrap">Follow-Up Date:</Label>
                <Input
                  type="date"
                  className="border-indigo-100 focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm text-indigo-900 cursor-pointer h-10 w-full sm:w-44"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                />
                {selectedDateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDateFilter("")}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-2"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList className="bg-white border border-gray-200 p-1 shadow-sm">
            <TabsTrigger value="pending" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
              <Clock className="h-4 w-4 mr-2" />
              Pending
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                {installations.filter(i => i._planned1 !== "" && i._actual1 === "" && (selectedDateFilter === "" || formatInputDate(i["Next Date"]) === selectedDateFilter)).length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              History
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                {installations.filter(i => i._planned1 !== "" && i._actual1 !== "" && (selectedDateFilter === "" || formatInputDate(i["Next Date"]) === selectedDateFilter)).length}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="mt-0">
          <InstallationTable data={filteredData} loading={fetchLoading} getStatusBadge={getStatusBadge} onApprove={handleApproveClick} activeTab={activeTab} />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <InstallationTable data={filteredData} loading={fetchLoading} getStatusBadge={getStatusBadge} onApprove={handleApproveClick} activeTab={activeTab} />
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-[650px] p-0 bg-white border-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-lg shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-bold">Follow Up Form</DialogTitle>
                <p className="text-indigo-100 text-sm mt-1 font-medium">Processing follow-up for SN: {selectedItem?.["SI NO"]}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/50">
            <form id="followup-form" onSubmit={handleApprovalSubmit} className="space-y-6">
              {/* Info Card */}
              <Card className="bg-white border border-indigo-100 shadow-sm overflow-hidden">
                <CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Order No.</p>
                    <p className="text-sm font-bold text-gray-900">{selectedItem?.["Order No."] || "N/A"}</p>
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Company Name</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{selectedItem?.["COMPANY NAME"] || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Invoice Date</p>
                    <p className="text-sm font-bold text-gray-900">{formatDateOnly(selectedItem?.["INVOICE DATE"])}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Invoice No</p>
                    <p className="text-sm font-bold text-gray-900 truncate" title={selectedItem?.["INVOICE NO"]}>{selectedItem?.["INVOICE NO"] || "N/A"}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Machine Names</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{selectedItem?.["Item-Name"] || "N/A"}</p>
                  </div>
                  {selectedItem?.["Next Date"] && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Last Follow-Up Date</p>
                      <p className="text-sm font-bold text-gray-900">{formatDateOnly(selectedItem["Next Date"])}</p>
                    </div>
                  )}
                  {(selectedItem?.["What Did Customer's Say (Remarks)"] || selectedItem?.["What Did Customer's Say"]) && (
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Last Follow-Up Remarks</p>
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {selectedItem["What Did Customer's Say (Remarks)"] || selectedItem["What Did Customer's Say"]}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dynamic Section */}
              <div className="space-y-4 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                <div className="space-y-2">
                  <Label className="text-indigo-900 font-bold flex items-center gap-2">
                    Client Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={approvalData.clientStatus}
                    onValueChange={(val) => setApprovalData({ ...approvalData, clientStatus: val })}
                  >
                    <SelectTrigger className="w-full border-indigo-200 focus:ring-indigo-500 h-11">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-indigo-100">
                      <SelectItem value="Yes" className="focus:bg-indigo-50">Yes</SelectItem>
                      <SelectItem value="No" className="focus:bg-indigo-50">No</SelectItem>
                      <SelectItem value="Next Date for Follow-Up" className="focus:bg-indigo-50">Next Date for Follow-Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {approvalData.clientStatus === "Yes" && (
                  <div className="space-y-5 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-gray-100"></div>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest px-2">Service Details</span>
                      <div className="h-px flex-1 bg-gray-100"></div>
                    </div>

                    <div className={showEngineer ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-2"}>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Installation / Service *</Label>
                        <Select
                          value={approvalData.serviceType}
                          onValueChange={(val) => setApprovalData({ ...approvalData, serviceType: val })}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select Service Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <div className="max-h-[200px] overflow-y-auto">
                              {serviceTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>

                      {showEngineer && (
                        <div className="space-y-2 animate-in fade-in duration-300">
                          <Label className="text-gray-700 font-semibold">Engineer Name *</Label>
                          <Select
                            value={approvalData.engineerName}
                            onValueChange={(val) => setApprovalData({ ...approvalData, engineerName: val })}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select Engineer" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <div className="max-h-[200px] overflow-y-auto">
                                {employeeNames.map(name => (
                                  <SelectItem key={name} value={name}>{name}</SelectItem>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {showServiceReport && (
                      <div className="space-y-2 animate-in fade-in duration-300">
                        <Label className="text-gray-700 font-semibold">Service Report (Image/Video/PDF) *</Label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf,.mp4"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all cursor-pointer group ${fileData.name ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:bg-indigo-50/50 hover:border-indigo-300'}`}
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${fileData.name ? 'bg-indigo-600' : 'bg-indigo-100'}`}>
                            {fileData.name ? <CheckCircle2 className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-indigo-600" />}
                          </div>
                          <p className="text-sm font-medium text-indigo-600">
                            {fileData.name ? fileData.name : "Upload a file"} <span className="text-gray-400 font-normal">or drag and drop</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Images, Videos, PDFs up to 10MB</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Remarks *</Label>
                      <textarea
                        className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-inner"
                        placeholder="Enter service remarks..."
                        value={approvalData.remarks}
                        onChange={(e) => setApprovalData({ ...approvalData, remarks: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {approvalData.clientStatus === "No" && (
                  <div className="space-y-2 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Label className="text-gray-700 font-semibold">Remarks *</Label>
                    <textarea
                      className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-inner"
                      placeholder="Why not?"
                      value={approvalData.remarks}
                      onChange={(e) => setApprovalData({ ...approvalData, remarks: e.target.value })}
                    />
                  </div>
                )}

                {approvalData.clientStatus === "Next Date for Follow-Up" && (
                  <div className="space-y-5 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Next Date for Follow-Up *</Label>
                      <Input
                        type="date"
                        className="h-10"
                        value={approvalData.followUpDate}
                        onChange={(e) => setApprovalData({ ...approvalData, followUpDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">What did Customer Said *</Label>
                      <textarea
                        className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-inner"
                        placeholder="Enter what the customer said..."
                        value={approvalData.customerSay}
                        onChange={(e) => setApprovalData({ ...approvalData, customerSay: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t shrink-0">
            <div className="flex gap-3 justify-end w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApprovalDialog(false)}
                disabled={isSubmitting}
                className="px-6 h-10 border-gray-300 text-gray-700 font-medium hover:bg-white"
              >
                Cancel
              </Button>
              <Button
                form="followup-form"
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-10 font-bold shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoaderIcon className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InstallationTable = ({ data, loading, getStatusBadge, onApprove, activeTab }) => {
  if (loading) {
    return (
      <Card className="border border-gray-100 shadow-xl p-12 flex flex-col items-center justify-center">
        <LoaderIcon className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="mt-4 text-gray-500 font-medium">Fetching data from Google Sheets...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View (Cards) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <Card key={idx} className="border border-gray-100 shadow-md overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-indigo-800 to-blue-800 p-3 flex justify-between items-center">
                <span className="font-bold text-white text-sm">{item["SI NO"]}</span>

              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Order & Company</p>
                    <p className="text-sm font-bold text-gray-900">{item["Order No."]}</p>
                    <p className="text-sm text-gray-600">{item["COMPANY NAME"]}</p>
                  </div>
                  {activeTab === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApprove(item)}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all shadow-sm h-8"
                    >
                      Approve
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Invoice No</p>
                    <p className="text-sm text-gray-700">{item["INVOICE NO"] || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Invoice Date</p>
                    <p className="text-sm text-gray-700">{item["INVOICE DATE"] || "N/A"}</p>
                  </div>
                  {item["Invoice Copy"] && item["Invoice Copy"].toString().startsWith("http") && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Invoice Copy</p>
                      <a
                        href={item["Invoice Copy"]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors font-semibold text-xs border border-indigo-200 mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Invoice
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Material Rcvd</p>
                  <p className="text-sm text-gray-700">{item["Actual material rcvd"] || "0"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Item Details</p>
                  <p className="text-sm text-gray-700 leading-tight">{item["Item-Name"]}</p>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-3 w-3 mr-1 text-indigo-400" />
                    Planned: {item["Planned 1"]}
                  </div>
                  {activeTab === "history" && item["Actual 1"] && (
                    <div className="flex items-center text-green-600 font-medium">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Actual: {item["Actual 1"]}
                    </div>
                  )}
                </div>

                {activeTab === "pending" && (
                  <div className="pt-2 mt-2 border-t border-gray-50 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wider">Last Follow-Up Date</p>
                        <p className="text-gray-700 font-medium">{formatDateOnly(item["Next Date"])}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wider">Remarks</p>
                        <p className="text-gray-700 font-medium truncate" title={item["What Did Customer's Say (Remarks)"] || item["What Did Customer's Say"] || ""}>
                          {item["What Did Customer's Say (Remarks)"] || item["What Did Customer's Say"] || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="pt-2 mt-2 border-t border-gray-50 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wider">Client Status</p>
                        <p className="text-gray-700 font-medium">{item["Client Status"] || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wider">Service Type</p>
                        <p className="text-gray-700 font-medium">{item["Service-Type"] || item["Installation/Service"] || "N/A"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wider">Engineer</p>
                        <p className="text-gray-700 font-medium">{item["Engineer Name"] || "N/A"}</p>
                      </div>
                      {item["Next Date"] && (
                        <div>
                          <p className="text-gray-400 font-semibold uppercase tracking-wider">Next Follow-up</p>
                          <p className="text-gray-700 font-medium">{formatDateOnly(item["Next Date"])}</p>
                        </div>
                      )}
                    </div>
                    {(item["What Did Customer's Say (Remarks)"] || item["What Did Customer's Say"]) && (
                      <div className="text-xs">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider">Remarks</p>
                        <p className="text-gray-700 font-medium line-clamp-2">
                          {item["What Did Customer's Say (Remarks)"] || item["What Did Customer's Say"]}
                        </p>
                      </div>
                    )}
                    {item["Service Report"] && item["Service Report"].toString().startsWith("http") && (
                      <div className="text-xs pt-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider">Service Report File</p>
                        <a
                          href={item["Service Report"]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors font-semibold text-xs border border-indigo-200 mt-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Service File
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-gray-500 font-medium">
            No records found.
          </Card>
        )}
      </div>

      {/* Desktop View (Table) */}
      <Card className="hidden md:block border border-gray-100 shadow-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-800 to-blue-800">
                {activeTab === "pending" && <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Action</th>}
                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">SI NO</th>
                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Order No</th>
                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Company Name</th>

                {activeTab === "pending" ? (
                  <>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Item Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Invoice Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Invoice No</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Invoice Copy</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Next Follow-Up Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Remarks</th>
                    {/* <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Material Rcvd</th> */}
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Client Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Installation/Service</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Engineer Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Service Report File</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Next Follow-Up Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Remarks</th>
                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Invoice Copy</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.length > 0 ? (
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                    {activeTab === "pending" && (
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onApprove(item)}
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          Approve
                        </Button>
                      </td>
                    )}
                    <td className="px-6 py-4 font-bold text-indigo-700 whitespace-nowrap">{item["SI NO"]}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">{item["Order No."]}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item["COMPANY NAME"]}</td>

                    {activeTab === "pending" ? (
                      <>
                        <td className="px-6 py-4 text-gray-600 min-w-[200px]">{item["Item-Name"]}</td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDateOnly(item["INVOICE DATE"])}</td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item["INVOICE NO"]}</td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {item["Invoice Copy"] && item["Invoice Copy"].toString().startsWith("http") ? (
                            <a
                              href={item["Invoice Copy"]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors font-semibold text-xs border border-indigo-200"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Invoice
                            </a>
                          ) : (
                            item["Invoice Copy"] || "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDateOnly(item["Next Date"])}</td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-[150px]" title={item["What Did Customer's Say (Remarks)"] || item["What Did Customer's Say"] || ""}>
                          {item["What Did Customer's Say (Remarks)"] || item["What Did Customer's Say"] || "-"}
                        </td>
                        {/* <td className="px-6 py-4 text-gray-600 text-center">{item["Actual material rcvd"]}</td> */}
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item["Client Status"] || "-"}</td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item["Service-Type"] || item["Installation/Service"] || "-"}</td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item["Engineer Name"] || "-"}</td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {item["Service Report"] && item["Service Report"].toString().startsWith("http") ? (
                            <a
                              href={item["Service Report"]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors font-semibold text-xs border border-indigo-200"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View File
                            </a>
                          ) : (
                            item["Service Report"] || "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDateOnly(item["Next Date"])}</td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={item["What Did Customer's Say (Remarks)"] || item["What Did Customer's Say"] || ""}>
                          {item["What Did Customer's Say (Remarks)"] || item["What Did Customer's Say"] || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {item["Invoice Copy"] && item["Invoice Copy"].toString().startsWith("http") ? (
                            <a
                              href={item["Invoice Copy"]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors font-semibold text-xs border border-indigo-200"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Invoice
                            </a>
                          ) : (
                            item["Invoice Copy"] || "-"
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No records matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ServiceInstallation;
