const categoryOrder = [
    'CSGO_Type_Knife', 
    'Type_Hands', 
    'CSGO_Type_SniperRifle', 
    'CSGO_Type_Rifle', 
    'CSGO_Type_Pistol',
    'CSGO_Type_SMG', 
    'CSGO_Type_Shotgun', 
    'CSGO_Type_Machinegun', 
    'Type_CustomPlayer', 
    'CSGO_Tool_Sticker'
];



// Funktion för att hämta inventariet med angivna Steam ID och API-nyckel
function fetchInventory(steamId, apiKey) {
    fetch(`/inventory?steamId=${encodeURIComponent(steamId)}&apiKey=${encodeURIComponent(apiKey)}`)
        .then(response => response.json())
        .then(data => {
            data.response.descriptions.sort((a, b) => {
                let categoryA = getCategory(a.tags);
                let categoryB = getCategory(b.tags);
    
                if(categoryA === 'Unknown' && categoryB === 'Unknown') return 0;
                if(categoryA === 'Unknown') return 1;
                if(categoryB === 'Unknown') return -1;
    
                return categoryOrder.indexOf(categoryA) - categoryOrder.indexOf(categoryB);
            });
            console.log('API Response:', data);
            if (data && data.response && data.response.descriptions && data.response.descriptions.length > 0) {
                const inventoryDiv = document.getElementById('inventory-section');
                inventoryDiv.innerHTML = ''; // Rensa tidigare innehåll


                data.response.descriptions.sort((a, b) => {
                    let categoryA = categoryOrder.indexOf(a.category);
                    let categoryB = categoryOrder.indexOf(b.category);
                    return categoryA - categoryB;
                });
                

                data.response.descriptions.forEach(item => {
                    // Skapa och lägg till HTML-element för varje föremål
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'inventory-item';
                    
                    // Gömmer tradeable items.
                    let tradelockDate;
                    if (item.owner_descriptions) {
                        const tradableAfterDescription = item.owner_descriptions.find(desc => desc.value && desc.value.includes("Tradable After"));
                        if (tradableAfterDescription) {
                            // Använd en RegExp för att extrahera datumet
                            const dateMatch = tradableAfterDescription.value.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4}\b/);
                            if (dateMatch) {
                                tradelockDate = dateMatch[0]; // Sätter tradelockDate till det matchade datumet
                            }
                        }
                    }


                    // Kontrollera att tradelockDate är definierad innan du sätter attributet
                    if (tradelockDate) {
                        itemDiv.setAttribute('data-tradelock-date', tradelockDate);
                    }
                    

                    // Hitta "Tradable After"-beskrivning och korta ner texten
                    if (item.owner_descriptions) {
                        const tradableAfterDescription = item.owner_descriptions.find(desc => desc.value && desc.value.includes("Tradable After"));
                        if (tradableAfterDescription) {
                            // Använd en RegExp för att extrahera datumet och omformatera det
                            const shortDateMatch = tradableAfterDescription.value.match(/\bJan \d+/);
                            const shortDate = shortDateMatch ? shortDateMatch[0] : 'Okänt Datum'; // 'Okänt Datum' eller annan standardtext om matchning misslyckas
                    
                            // Skapa div för att visa tradable info
                            const tradableDiv = document.createElement('div');
                            tradableDiv.className = 'tradable-info';
                            tradableDiv.style.display = 'flex'; // Sätt display till flex
                            tradableDiv.style.alignItems = 'center'; // Centrera element vertikalt
                    
                            // Skapa en img-element för låsikonen
                            const lockIcon = document.createElement('img');
                            lockIcon.src = 'https://i.imgur.com/18QrIza.png'; // Uppdatera med korrekt sökväg till ikonen
                            lockIcon.alt = 'Låsikon';
                            lockIcon.style = 'width: 15px; height: 15px; margin-right: 5px;'; // Justera stilen enligt dina behov
                    
                            // Lägg till ikonen och texten till tradableDiv
                            tradableDiv.appendChild(lockIcon);
                            tradableDiv.appendChild(document.createTextNode(`${shortDate}`));
                    
                            // Lägg till tradableDiv till itemDiv
                            itemDiv.appendChild(tradableDiv);
                        }
                    }
                    

                    // Lägg till bild, om den finns
                    if (item.icon_url) {
                        const img = document.createElement('img');
                        //img.crossOrigin = "anonymous"; // Lägg till detta
                        img.src = `http://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`;
                        itemDiv.appendChild(img);
                    }


                    let itemName = item.name;
                    // Kolla om namnet innehåller "StatTrak™"
                    if (itemName.includes('StatTrak™')) {
                        // Ersätt "StatTrak™" med ett span-element som har klassen 'stat-trak'
                        itemName = itemName.replace('StatTrak™', '<span class="stat-trak">StatTrak™</span>');
                    }

                    
                    // Split the name at " | " and create two separate lines
                    let nameParts = itemName.split(' | ');
                    let firstLine = nameParts[0]; // First part before " | "
                    let secondLine = nameParts.length > 1 ? nameParts[1] : ''; 


                    const itemNameElement = document.createElement('h3');
                    itemNameElement.innerHTML = itemName; // Använd innerHTML för att rendera HTML-taggen
                    itemDiv.appendChild(itemNameElement);


                    // Antag att 'item.tags' innehåller dina taggar
                    const typeTag = item.tags.find(tag => tag.category === 'Type');
                    if (typeTag) {
                        itemDiv.setAttribute('data-category', typeTag.internal_name);
                    }

                    
                    // // Hitta och lägg till exterior
                    const itemExteriorValue = item.descriptions.find(desc => desc.value.startsWith('Exterior:'));
                    const itemExterior = document.createElement('div');
                    itemExterior.className = 'item-exterior';
                    if (itemExteriorValue) {
                         // Anta att formatet är 'Exterior: [Tillstånd]', extrahera '[Tillstånd]' delen
                         itemExterior.textContent = itemExteriorValue.value.split(': ')[1];
                     } else {
                         itemExterior.textContent = '';
                     }
                     itemDiv.appendChild(itemExterior);


                    // Skapa textfält för pris
                    const priceInput = document.createElement('input');
                    priceInput.placeholder = 'Set Price'; // Text som visas när fältet är tomt
                    priceInput.className = 'price-input'; // Klassnamn för att kunna stila fältet
                    itemDiv.appendChild(priceInput);

                    itemNameElement.innerHTML = firstLine + '<br>' + secondLine;

                    // Lägg till föremålsdiven till inventoryDiv
                    inventoryDiv.appendChild(itemDiv);

                    
                });
            } else {
                console.log('Inga föremål att visa');
            }
        })
        .catch(error => {
            console.error('Error fetching inventory:', error);
        });
}


// Event Listener för att hantera klick på "Ladda inventarium" knappen
document.getElementById('btn-load-inventory').addEventListener('click', function() {
    var steamId = document.getElementById('steamIdInput').value;
    var apiKey = document.getElementById('apiKeyInput').value;

    if (steamId && apiKey) {
        fetchInventory(steamId, apiKey);
    } else {
        alert('Please enter your Steam ID and API key');
    }
});



document.getElementById('btn-save-image').addEventListener('click', function() {
    html2canvas(document.getElementById('inventory-section'), {
        useCORS: true
    }).then(function(canvas) {
        // Skapa en URL för PNG-bilden
        var imgURL = canvas.toDataURL('image/png');
        
        // Skapa en länk för nedladdning
        var dlLink = document.createElement('a');
        dlLink.download = 'inventory-screenshot.png';
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = ['image/png', dlLink.download, dlLink.href].join(':');

        // Lägg till länken i dokumentet och klicka på den
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
    });
});


function getCategory(tags) {
    // Antag att varje objekt har en tag som matchar en av kategorierna
    const typeTag = tags.find(tag => categoryOrder.includes(tag.internal_name));
    return typeTag ? typeTag.internal_name : 'Unknown';
}



document.querySelectorAll('.item-filter').forEach(filter => {
    filter.addEventListener('change', updateItemDisplay);
});

function updateItemDisplay() {
    const selectedCategories = [];
    document.querySelectorAll('.item-filter:checked').forEach(checkbox => {
        selectedCategories.push(checkbox.value);
    });

    document.querySelectorAll('.inventory-item').forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (selectedCategories.includes(itemCategory) || selectedCategories.length === 0) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}


document.getElementById('cbx-3').addEventListener('change', function() {
    const isChecked = this.checked;
    document.querySelectorAll('.inventory-item').forEach(item => {
        const tradelockDate = new Date(item.getAttribute('data-tradelock-date'));
        const now = new Date();

        if (isChecked && tradelockDate > now) {
            item.style.display = 'none'; // Dölj objektet om det har ett handelslås
        } else {
            item.style.display = ''; // Visa objektet annars
        }
    });
});



document.getElementById('sort-options').addEventListener('change', function() {
    const sortOption = this.value;
    const inventoryItems = Array.from(document.querySelectorAll('.inventory-item'));

    switch (sortOption) {
        case 'highest-price':
            sortByPrice(inventoryItems, true);
            break;
        case 'lowest-price':
            sortByPrice(inventoryItems, false);
            break;
        case 'name-asc':
            sortByName(inventoryItems, true);
            break;
        case 'name-desc':
            sortByName(inventoryItems, false);
            break;
    }

    const inventorySection = document.getElementById('inventory-section');
    inventorySection.innerHTML = '';
    inventoryItems.forEach(item => inventorySection.appendChild(item));
});


function sortByPrice(items, descending = true) {
    items.sort((a, b) => {
        // Hämta priset från input-fältet och omvandla det till ett flyttal.
        // Om inget pris är angett, sätt priset till 0.
        const priceA = parseFloat(a.querySelector('.price-input').value) || 0;
        const priceB = parseFloat(b.querySelector('.price-input').value) || 0;

        // Sortera i fallande ordning om 'descending' är true, annars i stigande ordning.
        return descending ? priceB - priceA : priceA - priceB;
    });
}


function sortByName(items, ascending = true) {
    items.sort((a, b) => {
        const nameA = a.querySelector('h3').textContent.toUpperCase(); // Antag att namnet finns i en h3-tagg
        const nameB = b.querySelector('h3').textContent.toUpperCase();
        if (nameA < nameB) {
            return ascending ? -1 : 1;
        }
        if (nameA > nameB) {
            return ascending ? 1 : -1;
        }
        return 0;
    });
}


document.getElementById('btn-load-inventory').addEventListener('click', function() {
    // Visa laddningsbaren
    var loadingBarContainer = document.getElementById('loading-bar-container');
    loadingBarContainer.style.display = 'block'; // Visa laddningsbaren
    var loadingBar = document.getElementById('loading-bar');
    loadingBar.style.width = '0%'; // Startposition
    setTimeout(function() {
        loadingBar.style.width = '100%'; // Starta animeringen
    }, 10); // En liten fördröjning för att CSS-transitionen ska hinna registreras

    // Ladda innehållet...
    loadInventory();
});


function loadInventory() {
    // Din kod för att ladda innehållet...
    // Här är en simulering av laddningsprocessen med setTimeout
    setTimeout(function() {
        // Laddningen är klar, göm laddningsbaren
        var loadingBarContainer = document.getElementById('loading-bar-container');
        var loadingBar = document.getElementById('loading-bar');
        loadingBar.style.width = '0%'; // Återställ bredden
        setTimeout(function() {
            loadingBarContainer.style.display = 'none'; // Göm laddningsbaren
        }, 500); // Vänta tills breddtransitionen är klar
    }, 2000); // Antag att det tar 2 sekunder att ladda innehållet
}



window.addEventListener('scroll', function() {
    var header = document.querySelector('.header-top');
    var scrollPosition = window.scrollY;

    if (scrollPosition > 430) {
        header.classList.add('border-active');
    } else {
        header.classList.remove('border-active');
    }
});

