const sheet_url = VITE_APPS_SCRIPT_API;
const Sheet_Id = "1teE4IIdCw7qnQvm_W7xAPgmGgpU13dtYw6y5ui01HHc";

async function checkMasterHeaders() {
    try {
        const response = await fetch(`${sheet_url}?sheetId=${Sheet_Id}&sheet=Master`);
        const result = await response.json();
        console.log("Master Headers:", result.data[0]);
    } catch (e) {
        console.error(e);
    }
}

checkMasterHeaders();
