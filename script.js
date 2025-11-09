// ==============================================
// សូមប្តូរព័ត៌មានទាំង ២ នេះ
// ==============================================
const API_KEY = 'AIzaSyBVd9FWiy4Vt72QFK8PM8qwtSOb6qM3FcE'; // ដាក់ API Key របស់អ្នកនៅទីនេះ
const SHEET_ID = '1Wy0rYaMAUG273clKcmPxPJ8q0LXYjizQjCyvZKoKN8Q';
const SHEET_NAME = 'DA';
// ==============================================

// កំណត់ Range សម្រាប់ថ្ងៃនីមួយៗ
const RANGES = {
    tuesday: `${SHEET_NAME}!B1:B11`,
    thursday: `${SHEET_NAME}!F1:F11`,
    saturday: `${SHEET_NAME}!J1:J11`
};

// រត់ Function ពេលគេហទំព័របើក
document.addEventListener('DOMContentLoaded', () => {
    setupDropdownListener(); 
    setupModalEvents();
    setupTotalDataModal(); // ‼️ ហៅ Function ថ្មីសម្រាប់ Modal សរុប
});

// Function សម្រាប់ Dropdown (មិនផ្លាស់ប្តូរ)
function setupDropdownListener() {
    const daySelect = document.getElementById('day-select');
    const scheduleDisplay = document.getElementById('schedule-display');
    const dataList = document.getElementById('data-list');
    const scheduleTitle = document.getElementById('schedule-title');

    daySelect.addEventListener('change', () => {
        const selectedDay = daySelect.value; 

        if (selectedDay) {
            scheduleDisplay.style.display = 'block';
            dataList.innerHTML = '<li>កំពុងទាញទិន្នន័យ...</li>'; 
            
            let dayName = '';
            let range = '';

            if (selectedDay === 'tuesday') {
                dayName = 'ថ្ងៃអង្គារ';
                range = RANGES.tuesday;
            } else if (selectedDay === 'thursday') {
                dayName = 'ថ្ងៃព្រហស្បតិ៍';
                range = RANGES.thursday;
            } else if (selectedDay === 'saturday') {
                dayName = 'ថ្ងៃសៅរ៍';
                range = RANGES.saturday;
            }

            scheduleTitle.innerText = dayName;
            fetchData(range, 'data-list');

        } else {
            scheduleDisplay.style.display = 'none';
            dataList.innerHTML = '';
            scheduleTitle.innerText = '';
        }
    });
}


// Function សម្រាប់ទាញទិន្នន័យ (មិនផ្លាស់ប្តូរ)
async function fetchData(range, listElementId) {
    const listElement = document.getElementById(listElementId);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const names = data.values;

        if (names && names.length > 0) {
            populateList(listElement, names);
        } else {
            listElement.innerHTML = '<li>មិនមានទិន្នន័យ</li>';
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        listElement.innerHTML = '<li>Error: មិនអាចទាញទិន្នន័យបាន</li>';
    }
}

// Function សម្រាប់បង្ហាញឈ្មោះ (មិនផ្លាស់ប្តូរ)
function populateList(listElement, names) {
    listElement.innerHTML = ''; 

    names.forEach(row => {
        const name = row[0]; 
        if (name) { 
            const li = document.createElement('li');
            
            li.innerHTML = `
                <span class="name">${name}</span>
                <div class="buttons">
                    <button class="btn btn-done">បានធ្វើ</button>
                    <button class="btn btn-not-done">មិនបានធ្វើ</button>
                </div>
            `;
            
            const notDoneButton = li.querySelector('.btn-not-done');
            notDoneButton.addEventListener('click', () => {
                li.classList.remove('is-done');
                openReasonModal(li); 
            });

            const doneButton = li.querySelector('.btn-done');
            doneButton.addEventListener('click', () => {
                li.classList.remove('is-not-done');
                li.classList.add('is-done');
            });

            listElement.appendChild(li);
        }
    });
}

// =========== មុខងារសម្រាប់ Modal 'មូលហេតុ' (មិនផ្លាស់ប្តូរ) ===========
const reasonModal = document.getElementById('reason-modal');
let currentListItem = null; 

function openReasonModal(listItem) {
    currentListItem = listItem; 
    reasonModal.style.display = 'flex'; 
}

function setupModalEvents() {
    const closeModalButton = document.getElementById('close-modal');
    const submitReasonButton = document.getElementById('submit-reason');
    const reasonText = document.getElementById('reason-text');

    closeModalButton.addEventListener('click', () => {
        reasonModal.style.display = 'none';
        reasonText.value = ''; 
    });

    submitReasonButton.addEventListener('click', () => {
        const reason = reasonText.value;
        if (reason.trim() === '') {
            alert('សូមបញ្ចូលមូលហេតុ!');
            return;
        }

        console.log(`មូលហេតុសម្រាប់ ${currentListItem.querySelector('.name').textContent}: ${reason}`);

        if (currentListItem) {
            currentListItem.classList.add('is-not-done');
        }
        
        reasonModal.style.display = 'none'; 
        reasonText.value = ''; 
    });
}


// =========== ‼️ មុខងារថ្មីសម្រាប់ Modal 'សរុបទិន្នន័យ' ===========

function setupTotalDataModal() {
    const totalDataButton = document.getElementById('btn-total-data');
    const totalModal = document.getElementById('total-data-modal');
    const closeModalButton = document.getElementById('btn-close-total-modal');
    const copyButton = document.getElementById('btn-copy-data');
    
    // 1. ពេលចុចប៊ូតុង 'សរុបទិន្នន័យ'
    totalDataButton.addEventListener('click', () => {
        generateSummary(); // បង្កើតអត្ថបទសង្ខេប
        totalModal.style.display = 'flex'; // បង្ហាញ Modal
    });

    // 2. ពេលចុចប៊ូតុង 'បិទ'
    closeModalButton.addEventListener('click', () => {
        totalModal.style.display = 'none';
    });

    // 3. ពេលចុចប៊ូតុង 'ចម្លងទិន្នន័យ'
    copyButton.addEventListener('click', () => {
        const dataOutput = document.getElementById('total-data-output');
        
        // ប្រើ Clipboard API ថ្មី សម្រាប់ចម្លង
        navigator.clipboard.writeText(dataOutput.value).then(() => {
            // បើចម្លងបានជោគជ័យ
            copyButton.textContent = '✅ បានចម្លង!';
            copyButton.style.backgroundColor = '#28a745'; // ប្តូរពណ៌បៃតង
            
            // ឱ្យវត្រឡប់មកដូចដើមវិញ ក្រោយ 2 វិនាទី
            setTimeout(() => {
                copyButton.textContent = 'ចម្លងទិន្នន័យ';
                copyButton.style.backgroundColor = '#007bff'; // ត្រឡប់មកពណ៌ខៀវវិញ
            }, 2000);

        }).catch(err => {
            console.error('Error copying text: ', err);
            alert('ការចម្លងមានបញ្ហា!');
        });
    });
}

// ‼️ Function ថ្មីសម្រាប់បង្កើតអត្ថបទសង្ខេប
function generateSummary() {
    const listItems = document.querySelectorAll('#data-list li');
    const scheduleTitle = document.getElementById('schedule-title').innerText;
    const dataOutput = document.getElementById('total-data-output');
    const modalTitle = document.getElementById('total-data-title');

    // កំណត់ចំណងជើង Modal
    modalTitle.innerText = `ទិន្នន័យសរុប (${scheduleTitle})`;

    let doneList = [];
    let notDoneList = [];
    let pendingList = [];

    // ពិនិត្យ 'li' នីមួយៗ ដើម្បីដឹងពីស្ថានភាព
    listItems.forEach(item => {
        const name = item.querySelector('.name').textContent;
        if (item.classList.contains('is-done')) {
            doneList.push(name);
        } else if (item.classList.contains('is-not-done')) {
            notDoneList.push(name);
        } else {
            pendingList.push(name);
        }
    });

    // ចាប់ផ្តើមបង្កើតអត្ថបទ
    let outputText = `ទិន្នន័យសរុបសម្រាប់ ${scheduleTitle}\n`;
    outputText += `---------------------------------\n\n`;

    // បញ្ជី 'បានធ្វើ'
    outputText += `✅ បានធ្វើ (${doneList.length} នាក់):\n`;
    if (doneList.length > 0) {
        doneList.forEach((name, index) => {
            outputText += `${index + 1}. ${name}\n`;
        });
    } else {
        outputText += "(មិនមាន)\n";
    }

    // បញ្ជី 'មិនបានធ្វើ'
    outputText += `\n❌ មិនបានធ្វើ (${notDoneList.length} នាក់):\n`;
    if (notDoneList.length > 0) {
        notDoneList.forEach((name, index) => {
            outputText += `${index + 1}. ${name}\n`;
        });
    } else {
        outputText += "(មិនមាន)\n";
    }

    // បញ្ជី 'កំពុងរង់ចាំ'
    outputText += `\n⌛ កំពុងរង់ចាំ (${pendingList.length} នាក់):\n`;
    if (pendingList.length > 0) {
        pendingList.forEach((name, index) => {
            outputText += `${index + 1}. ${name}\n`;
        });
    } else {
        outputText += "(មិនមាន)\n";
    }

    // បញ្ចូលអត្ថបទទៅក្នុង textarea
    dataOutput.value = outputText.trim();
}