import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  PhoneCall,
  FileText,
  MapPin,
  Receipt,
  CreditCard,
  Loader2Icon,
} from "lucide-react";
import { set } from "date-fns";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [allTickets, setAllTickets] = React.useState([]);
  const [fetchLoading, setFetchLoading] = React.useState(false);
  const [priorityData, setPriorityData] = React.useState([]);
  const [quataionData, setQuataionData] = React.useState([]);
  const [invoiceData, setInvoiceData] = React.useState([]);
  const [siteVisitData, setSiteVisitData] = React.useState([]);
  const [engineerData, setEngineerData] = React.useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [warrantyCheckData, setWarrantyCheckData] = useState([]);

  const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

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

        const userName = localStorage.getItem("currentUsername");

        const roleStorage = localStorage.getItem("o2d-auth-storage");
        const parsedData = JSON.parse(roleStorage);
        const role = parsedData.state.user.role;

        const allDataTotal =
          role === "user"
            ? allData.filter((item) => item["CREName"] === userName)
            : role === "engineer"
              ? allData.filter((item) => item["engineerAssign"] === userName)
              : allData;

        setAllTickets(allDataTotal);

        // console.log("allData", allData);

        const priority = allData.map((item) => item.priority);

        const priorityCounts = priority.reduce((acc, priority) => {
          // Capitalize first letter for display
          const formattedName =
            priority.charAt(0).toUpperCase() + priority.slice(1);

          if (!acc[formattedName]) {
            acc[formattedName] = 0;
          }
          acc[formattedName]++;
          return acc;
        }, {});

        // Convert to array of objects
        const prioritySources = Object.entries(priorityCounts).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        setPriorityData(prioritySources);

        const quatationPending = allData.filter(
          (item) => item.planned3 !== "" && item.actual3 === ""
        );

        setQuataionData(quatationPending);

        const invoicePending = allData.filter(
          (item) => item.planned12 !== "" && item.actual12 === ""
        );
        setInvoiceData(invoicePending);

        const siteVisitPending = allData.filter(
          (item) => item.planned5 !== "" && item.actual5 === ""
        );
        setSiteVisitData(siteVisitPending);

        const engineer = allData.filter(
          (item) => item.planned11 !== "" && item.actual11 === ""
        );
        setEngineerData(engineer);

        const paymentData = allData.reduce((acc, item) => {
          if (item.timeStemp && item.payRightNow) {
            // Extract month from timeStemp (assuming format "DD/MM/YYYY HH:MM:SS")
            const dateParts = item.timeStemp.split(" ")[0].split("/");
            if (dateParts.length === 3) {
              const monthNum = parseInt(dateParts[1], 10);
              const year = dateParts[2];

              // Convert month number to short month name
              const monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              const month = monthNames[monthNum - 1];

              const monthYearKey = `${month} ${year}`;

              // Initialize if this month doesn't exist yet
              if (!acc[monthYearKey]) {
                acc[monthYearKey] = 0;
              }

              // Add the payment amount (convert to number if it's a string)
              const paymentAmount =
                typeof item.payRightNow === "string"
                  ? parseFloat(item.payRightNow) || 0
                  : Number(item.payRightNow) || 0;

              acc[monthYearKey] += paymentAmount;
            }
          }
          return acc;
        }, {});

        // Convert to array format
        const paymentSources = Object.entries(paymentData).map(
          ([month, revenue]) => ({
            month,
            revenue,
          })
        );

        // console.log("paymentSources", paymentSources);
        setPaymentData(paymentSources); // You'll need to create this state variable

        // Process warranty check data
        const warrantyCheckCounts = allData.reduce((acc, item) => {
          if (item.warrantyCheck) {
            // Convert to proper case for consistent comparison
            const status = item.warrantyCheck.trim();

            if (status.toLowerCase() === "yes") {
              acc.yes = (acc.yes || 0) + 1;
            } else if (status.toLowerCase() === "no") {
              acc.no = (acc.no || 0) + 1;
            }
          }
          return acc;
        }, {});

        // Create the warranty check data array
        const warrantyCheckData = [
          { name: "Yes", value: warrantyCheckCounts.yes || 0 },
          { name: "No", value: warrantyCheckCounts.no || 0 },
        ];

        // console.log("Warranty Check Data:", warrantyCheckData);
        setWarrantyCheckData(warrantyCheckData); // You'll need to create this state variable
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Skeleton Components
  const SkeletonCard = () => (
    <Card className="shadow rounded-2xl p-4 flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
        <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse"></div>
      </div>
    </Card>
  );

  const SkeletonChart = () => (
    <Card className="p-6 shadow rounded-2xl">
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-4 animate-pulse"></div>
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
    </Card>
  );

  const SkeletonBarChart = () => (
    <Card className="p-6 shadow rounded-2xl">
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-4 animate-pulse"></div>
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
    </Card>
  );

  if (fetchLoading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* KPIs Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>

        {/* Bar Chart Skeleton */}
        <SkeletonBarChart />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow rounded-2xl p-4 flex items-center gap-3">
          <PhoneCall className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Enquiries</p>
            <p className="text-xl font-bold">{allTickets?.length}</p>
          </div>
        </Card>

        <Card className="shadow rounded-2xl p-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Quotations</p>
            <p className="text-xl font-bold">{quataionData?.length}</p>
          </div>
        </Card>

        <Card className="shadow rounded-2xl p-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Site Visits</p>
            <p className="text-xl font-bold">{siteVisitData?.length}</p>
          </div>
        </Card>

        <Card className="shadow rounded-2xl p-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Invoices</p>
            <p className="text-xl font-bold">{invoiceData?.length}</p>
          </div>
        </Card>

        <Card className="shadow rounded-2xl p-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Engineer</p>
            <p className="text-xl font-bold">{engineerData?.length}</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enquiry Sources Pie Chart */}
        <Card className="p-6 shadow rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">Priority Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {priorityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Trend Line Chart */}
        <Card className="p-6 shadow rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">
            Pay Right Now Revenue Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={paymentData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quotation Status */}
      <Card className="p-6 shadow rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Warranty Check Status</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={warrantyCheckData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value">
              {warrantyCheckData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
