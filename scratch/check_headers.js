const sheet_url = VITE_APPS_SCRIPT_API;
const Sheet_Id = "1teE4IIdCw7qnQvm_W7xAPgmGgpU13dtYw6y5ui01HHc";

async function checkHeaders() {
    try {
        const response = await fetch(`${sheet_url}?sheetId=${Sheet_Id}&sheet=Service-Installation`);
        const result = await response.json();
        console.log("Headers:", result.data[result.data.findIndex(row => row[0] === "Timestamp")]);
    } catch (e) {
        console.error(e);
    }
}

checkHeaders();
