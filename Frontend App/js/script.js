let map;
let infoWindow;
const markers = [];
const API_URL = 'http://localhost:3000/api/stores';
const Stoughton = { lat: 42.1229, lng: -71.1092 };


function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        // location: Stoughton, MA
        center: Stoughton, // default location
        zoom: 9,
    });
    infoWindow = new google.maps.InfoWindow();
}

const onEnter = (e) => {
    if(e.key === 'Enter') {
        getStores();
    }
}

const getStores = () => {
    const zipCode = document.getElementById('search-input').value;
    // checks if value is empty
    if(!zipCode) {
        return;
    }
    fetch(`${API_URL}?zip_code=${zipCode}`, {
        method: 'GET'
    }).then(response => {
        if(response.status == 200) {
            return response.json();
        } else {
            throw new Error(response.status);
        }
    }).then(storesData => {
        if(storesData.length > 0) {
            clearLocations();
            searchLocationsNear(storesData);
            createStoresList(storesData);
            setOnClickListener(storesData);
        }else {
            clearLocations();
            noStoresFound();
        }
    })
}

const noStoresFound = () => {
    html = `
        <div class="no-stores-found">
            No Stores Found
        </div>
    `
    document.querySelector('.stores-list').innerHTML = html;
}

const clearLocations = () => {
    infoWindow.close();
    for(let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers.length = 0;
}

const setOnClickListener = () => {
    let storeElements = document.querySelectorAll('.store-list-item-container');
    storeElements.forEach((elem, index) => {
        elem.addEventListener('click', () => {
            google.maps.event.trigger(markers[index], 'click');
        });
    })
}

const createStoresList = (stores) => {
    let storeListHTML = ''
    stores.forEach((store, index) => {
        storeListHTML += `
            <!-- Store Item Container -->
            <div class="store-list-item-container">
                
                <!-- Store Item Info-Container -->
                <div class="store-list-item-info-container">
                        <!-- Address -->
                    <div class="store-list-item-address-container">
                        <div class="store-list-item-address-line-1">${store.addressLines[0]}</div>
                        <div class="store-list-item-address-line-2">${store.addressLines[1]}</div>
                    </div>
                        <!-- Phone Number -->
                    <div class="store-list-item-phone-number-container">
                        ${store.phoneNumber}
                    </div>
                </div>
                <!-- Store Item Number-Container -->
                <div class="store-list-item-number-container">
                    ${index+1}
                </div>
            
            </div>      
            <hr>
            `
    })
    
    document.querySelector('.stores-list').innerHTML = storeListHTML; // Resets all of the inner HTML
}

const searchLocationsNear = (stores) => {
    const bounds = new google.maps.LatLngBounds();
    
    stores.forEach((store, index) => {
        let latlng = new google.maps.LatLng(
            store.location.coordinates[1], // latitude
            store.location.coordinates[0]  // longitude
        )
        let name = store.storeName;
        let address = store.addressLines[0];
        let openStatus = store.openStatusText;
        let phoneNumber = store.phoneNumber;
        bounds.extend(latlng);
        
        createMarker(latlng, name, address, openStatus, phoneNumber, index+1); // to start marker labels at 1 instead of 0
    });
    
    map.fitBounds(bounds);
}

function createMarker(latlng, name, address, openStatus, phoneNumber, storeNumber) {
    let html = `
        <div class="store-info-window">
            <div class="store-info-name">
                ${name}
            </div>
            <div class="store-info-open-status">
                ${openStatus}
            </div>
            <div class="store-info-address">
                <div class="icon">
                    <i class="fas fa-location-arrow"></i>
                </div>
                <span>
                    ${address}
                </span>
            </div>
            <div class="store-info-phone">
                <div class="icon">
                    <i class="fas fa-phone-alt"></i>
                </div>
                <span>    
                    <a href="tel:${phoneNumber}">${phoneNumber}</a>
                </span>
            </div>

        </div>
    `
    let marker = new google.maps.Marker({
            position: latlng,
            map: map,
            label: `${storeNumber}` // needs to be string value
        });

    google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        });
    
    markers.push(marker); // pushes marker to globally declared 'markers' array.
}
