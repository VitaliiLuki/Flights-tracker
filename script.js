// Создаем новый объект URLSearchParams
const paramsForSchedule = new URLSearchParams();
const paramsForCities = new URLSearchParams();
const paramForFlight = new URLSearchParams();

const apiKey = 'Insert your key';
const depIata = 'SOF';

paramsForSchedule.append('dep_iata', depIata);
paramsForSchedule.append('api_key', apiKey);
paramsForCities.append('api_key', apiKey);
paramForFlight.append('api_key', apiKey);

const requestURLSchedules = 'https://airlabs.co/api/v9/schedules?' + paramsForSchedule.toString()
const requestURLCities = 'https://airlabs.co/api/v9/cities?' + paramsForCities.toString()
const requestURLFlight = 'https://airlabs.co/api/v9/flight?' + paramForFlight.toString()


const weekDays = {
    'воскресенье' : 'Sun',
    'понедельник': 'Mon',
    'вторник': 'Tue',
    'среда': 'Wed',
    'четверг': 'Thu',
    'пятница': 'Fri',
    'суббота': 'Sat',
  }
  
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  

// Utilities
function getNormalizedDate(timestamp) {
    const dateSplited = timestamp.split(" ")
    return dateSplited[dateSplited.length-1]
}

function insertSpaceBetweenLettersAndNumbers(str) {
    // Используем регулярное выражение для разделения строк между буквами и цифрами
    return str.replace(/([A-Za-z]+)(\d+)/g, '$1 $2');
}

// Преобразуем timestamp в дату в формате: день недели, число месяц
function getFormattedDate(timestamp) {

    const timestampInMilliseconds = timestamp * 1000;
    const date = new Date(timestampInMilliseconds);
    const monthDate = date.getDate()
    const month = date.getMonth()
    const dayOfWeekString = date.toLocaleDateString('ru-RU', { weekday: 'long' });
    return `${weekDays[dayOfWeekString]}, ${monthDate} ${months[month]}` 
}

// Добавляем в проект и указываем в параметре onclick
function getSpecificChildElement() {
    // Ищем дочерний элемент с указанным классом внутри родительского элемента
    const childElement = this.querySelector('.' + 'flight-detail-info');
  
    if (childElement) {
      // Делаем что-то с найденным дочерним элементом
      console.log('Найден дочерний элемент:', childElement);
      if (childElement.style.display == 'none') {
        console.log(childElement.style.display)
        childElement.style.display = 'block';
        console.log(childElement.style.display);
      } else {
        childElement.style.display = 'none'
      }
    } else {
      console.log('Дочерний элемент с классом ' + specificChildClass + ' не найден.');
    }
}

// треккер пути
function updatePosition(dep_time, arr_time, line, plane) {

    const currentTime = Math.floor(Date.now() / 1000);
    const flightDuration = arr_time - dep_time

    const flightTimePassed = currentTime - dep_time
    const partTime = flightTimePassed/flightDuration
    
    // 550px ширина трека
    if (partTime > 1) {
        line.style.width = 550 + 'px';
        plane.style.left = (550 - 16) + 'px';
    } else if (partTime <= 0) {
        line.style.width = '0px';
        plane.style.left = '0px';
    } else {
        const newPosition = partTime * 550;
        line.style.width = newPosition + 'px';
        plane.style.left = newPosition + 'px';
    }
    
  }


// Возвращает города вылета и прилета по flight_iata
async function getCitiesName(FlightData, flightUrl) {

    const arrivalDepurtureCities = {}

    FlightData.forEach(flight => {
        arrivalDepurtureCities[flight.flight_iata] = {}
    })
    
    for (key in arrivalDepurtureCities) {
        const paramFlightIata = new URLSearchParams();
        paramFlightIata.append('flight_iata', key);

        try {
            const response = await fetch(flightUrl+'&'+paramFlightIata.toString());
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const cityDepartFrom = await data.response!= undefined
                ? data.response['dep_city']
                : 'Not found'
            const cityArriveto = await data.response!= undefined
            ? data.response['arr_city']
            : 'Not found'

            arrivalDepurtureCities[key] = {
                dep_city: cityDepartFrom,
                arr_city: cityArriveto
            };
        } catch (error) {
            console.error('Fetch error:', error);
            arrivalDepurtureCities[key] = {};
        }
    }
    return arrivalDepurtureCities
}

// Создаем детальный блок с элементами
function createFlightDetailInfo(flight, departCity, arriveCity) {

    // Создаем контейнер flightDetailInfo
    const flightDetailInfo = document.createElement('div');
    flightDetailInfo.classList.add('flight-detail-info');
  
    // Создаем блок треккер, в нем будут 
    // Код аэропорта вылета, прилета и отслеживание
    // полета
    const tracking = document.createElement('div');
    tracking.classList.add('tracking');
  
    const codeAirportDepartFrom = document.createElement('p');
    codeAirportDepartFrom.classList.add('code-airport-departFrom');
    codeAirportDepartFrom.textContent = flight.dep_iata;
  
    const scale = document.createElement('div');
    scale.id = 'scale';
  
    const line = document.createElement('div');
    line.id = 'line';
  
    const plane = document.createElement('div');
    plane.id = 'plane';
    plane.textContent = '✈️';
  
    const codeAirportLandTo = document.createElement('p');
    codeAirportLandTo.classList.add('code-airport-landTo');
    codeAirportLandTo.textContent = flight.arr_iata;
    ///////////////////////////////////////////////////
  
    // Создаем блок с данными о вылете
    const departFrom = document.createElement('div');
    departFrom.classList.add('departFrom');
  
    // создаем абзац  
    const cityDateDeparture = document.createElement('p');
    cityDateDeparture.classList.add('city-date-departure');
    // Преобразуем дату в сек, в формат день недели, число месяц
    const dateDepFrom = flight.dep_estimated_ts != undefined 
        ? flight.dep_estimated_ts
        : flight.dep_time_ts
    
    // console.log('flight.dep_estimated_ts', flight.dep_estimated_ts)
    cityDateDeparture.textContent = `${departCity} · ${getFormattedDate(dateDepFrom)}`;
  
    // Создаем таблицу и присваеваем класс
    const tableFlightInfoDepartFrom = document.createElement('table');
    tableFlightInfoDepartFrom.classList.add('table-flight-info');
  
    // Создаем заголовок таблицы для вылета
    const tableHeaderRowDepartFrom = document.createElement('tr');
    const tableHeader1DepartFrom = document.createElement('th');
    tableHeader1DepartFrom.classList.add('small-gray-table-header');
    tableHeader1DepartFrom.textContent = 'Departure time';
    const tableHeader2DepartFrom  = document.createElement('th');
    tableHeader2DepartFrom.classList.add('small-gray-table-header', 'left-padding-colomn');
    tableHeader2DepartFrom.textContent = 'Terminal';
    const tableHeader3DepartFrom  = document.createElement('th');
    tableHeader3DepartFrom.classList.add('small-gray-table-header', 'left-padding-colomn');
    tableHeader3DepartFrom.textContent = 'Gate';
  
    // Создаем строки таблицы для вылета
    const tableRowDepartFrom = document.createElement('tr');
    const tableData1DepartFrom = document.createElement('td');
    tableData1DepartFrom.classList.add('values-font-size');
    tableData1DepartFrom.textContent = getNormalizedDate(flight.dep_time);
    const tableData2DepartFrom = document.createElement('td');
    tableData2DepartFrom.classList.add('values-font-size', 'left-padding-colomn');
    tableData2DepartFrom.textContent = flight.dep_terminal != null ? flight.dep_terminal : '-';
    const tableData3DepartFrom = document.createElement('td');
    tableData3DepartFrom.classList.add('values-font-size', 'left-padding-colomn');
    tableData3DepartFrom.textContent = flight.dep_gate != null ? flight.dep_gate : '-';
  
    const arriveTo = document.createElement('div');
    arriveTo.classList.add('arriveTo');
  
    // создаем абзац для вылета
    const cityDateArriveTo = document.createElement('p');
    cityDateArriveTo.classList.add('city-date-arrival');
    // Преобразуем дату в сек, в формат день недели, число месяц
    const dateArrTo = flight.arr_estimated_ts != undefined 
        ? flight.arr_estimated_ts
        : flight.arr_time_ts
    cityDateArriveTo.textContent = `${arriveCity} · ${getFormattedDate(dateArrTo)}`;
    

    // Создаем таблицу и присваеваем класс
    const tableFlightInfoArriveTo = document.createElement('table');
    tableFlightInfoArriveTo.classList.add('table-flight-info');

    // Создаем заголовок таблицы для вылета
    const tableHeaderRowArriveTo = document.createElement('tr');
    const tableHeader1ArriveTo= document.createElement('th');
    tableHeader1ArriveTo.classList.add('small-gray-table-header');
    tableHeader1ArriveTo.textContent = 'Arrival time';
    const tableHeader2ArriveTo  = document.createElement('th');
    tableHeader2ArriveTo.classList.add('small-gray-table-header', 'left-padding-colomn');
    tableHeader2ArriveTo.textContent = 'Terminal';
    const tableHeader3ArriveTo  = document.createElement('th');
    tableHeader3ArriveTo.classList.add('small-gray-table-header', 'left-padding-colomn');
    tableHeader3ArriveTo.textContent = 'Gate';

    // Создаем строки таблицы для вылета
    const tableRowArriveTo = document.createElement('tr');
    const tableData1ArriveTo = document.createElement('td');
    tableData1ArriveTo.classList.add('values-font-size');
    tableData1ArriveTo.textContent = getNormalizedDate(flight.arr_time);
    // tableData1ArriveTo.textContent = '13:55';
    const tableData2ArriveTo = document.createElement('td');
    tableData2ArriveTo.classList.add('values-font-size', 'left-padding-colomn');
    tableData2ArriveTo.textContent = flight.arr_terminal != null ? flight.arr_terminal : '-';
    const tableData3ArriveTo = document.createElement('td');
    tableData3ArriveTo.classList.add('values-font-size', 'left-padding-colomn');
    tableData3ArriveTo.textContent = flight.arr_gate != null ? flight.arr_gate : '-';

    // Собираем структуру
  
    // Собираем таблицу вылетов
    tableHeaderRowDepartFrom.appendChild(tableHeader1DepartFrom);
    tableHeaderRowDepartFrom.appendChild(tableHeader2DepartFrom);
    tableHeaderRowDepartFrom.appendChild(tableHeader3DepartFrom);
  
    tableRowDepartFrom.appendChild(tableData1DepartFrom);
    tableRowDepartFrom.appendChild(tableData2DepartFrom);
    tableRowDepartFrom.appendChild(tableData3DepartFrom);
  
    tableFlightInfoDepartFrom.appendChild(tableHeaderRowDepartFrom);
    tableFlightInfoDepartFrom.appendChild(tableRowDepartFrom);
    ///////////////////////////////////////////////////////////
  
  
    // Собираем таблицу прилетов
    tableHeaderRowArriveTo.appendChild(tableHeader1ArriveTo);
    tableHeaderRowArriveTo.appendChild(tableHeader2ArriveTo);
    tableHeaderRowArriveTo.appendChild(tableHeader3ArriveTo);
  
    tableRowArriveTo.appendChild(tableData1ArriveTo);
    tableRowArriveTo.appendChild(tableData2ArriveTo);
    tableRowArriveTo.appendChild(tableData3ArriveTo);
  
    tableFlightInfoArriveTo.appendChild(tableHeaderRowArriveTo);
    tableFlightInfoArriveTo.appendChild(tableRowArriveTo);
    //////////////////////////////////////////////////////////////
  
    // Добавляем элементы в DOM
  
    // Собираем блок треккинг
    scale.appendChild(line);
    scale.appendChild(plane);
  
    tracking.appendChild(codeAirportDepartFrom);
    tracking.appendChild(scale);
    tracking.appendChild(codeAirportLandTo);
    //////////////////////////////////////////////////////////////
  
    // Собираем блок departFrom
    departFrom.appendChild(cityDateDeparture);
    departFrom.appendChild(tableFlightInfoDepartFrom);
  
    // Собираем блок arriveTo
    arriveTo.appendChild(cityDateArriveTo);
    arriveTo.appendChild(tableFlightInfoArriveTo);
  
    flightDetailInfo.appendChild(tracking);
    flightDetailInfo.appendChild(departFrom);
    flightDetailInfo.appendChild(arriveTo);

    updatePosition(dateDepFrom, dateArrTo, line, plane)
  
    return flightDetailInfo;
  }

// Парсит список данных о рейсах. Строит элементы с общей информацией о рейсе.
const getFlightData = async function(flightsData) {
    // Получаем контейнер, в который будем добавлять элементы
    const flightListContainer = document.getElementById("flight-list");
    // const citiesData = await getCitiesData(requestURLCities)
    const cities = await getCitiesName(flightsData, requestURLFlight)

    // let count = 0;
    flightsData.forEach(flight => {

        const cityArriveto = cities[flight.flight_iata].arr_city
        const cityDepartFrom = cities[flight.flight_iata].dep_city

        const flightItem = document.createElement("div");
        flightItem.classList.add("flight-widget");
        flightItem.onclick = getSpecificChildElement;

        const flightTimeStatus = document.createElement("div")
        flightTimeStatus.classList.add("flight-time-status");

        const flightDetails = document.createElement("div")
        flightDetails.classList.add("flight-details");

        const flightTime = document.createElement("div")
        flightTime.classList.add("flight-time");
        flightTime.textContent = getNormalizedDate(flight.dep_time);

        const flightStatus = document.createElement("div")
        flightStatus.classList.add("flight-status");
        flightStatus.textContent = flight.status;

        const flightAirline = document.createElement("div")
        flightAirline.classList.add("flight-airline");
        flightAirline.textContent = flight.flight_iata != null
            ? insertSpaceBetweenLettersAndNumbers(flight.flight_iata)
            : flight.flight_number;

        const flightLocation = document.createElement("div")
        flightLocation.classList.add("flight-location");

        flightLocation.innerHTML = cityArriveto !== undefined
        ? `<span>${cityArriveto}  </span> <span style="color: gray; font-size: 16px">${flight.arr_iata}</span>`
        : `<span>City unknown</span> <span style="color: gray; font-size: 16px">${flight.arr_iata}</span>`;


        const detailFlightData = createFlightDetailInfo(flight, cityDepartFrom, cityArriveto)

        flightItem.appendChild(flightTimeStatus);
        flightItem.appendChild(flightDetails);
        flightItem.appendChild(detailFlightData);
        flightTimeStatus.appendChild(flightTime);
        flightTimeStatus.appendChild(flightStatus);
        flightDetails.appendChild(flightAirline);
        flightDetails.appendChild(flightLocation);


        flightListContainer.appendChild(flightItem);
    });
    
}

// Запрос на /schedules
// Обработка респонс и вызов функции getFlightData
function getResponse(url) {
    fetch(url, {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
       
        return response.json();
    })
    .then(data => {
        let resp = data.response;
        getFlightData(resp)
        })    
    .catch(error => console.error('Fetch error:', error));
}


// Запуск скрипта
getResponse(requestURLSchedules)
