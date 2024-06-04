const changeMonth = (months, monthIndex) => {
    const prevMonthDays = months[monthIndex-1]
    const currMonthDays = months[monthIndex]
    let start = prevMonthDays.length - currMonthDays[0].getDay()
    const displayDates = prevMonthDays.concat(currMonthDays).slice(start)
    renderCalendar(displayDates)
}

const handleSubmitAppointmentTime = e => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const appointmentID = formData.get('time-button')
    selectedAppointment = appointmentID
    const errorMsg = document.querySelector('#form-select-time .error')
    if (selectedAppointment == null)
        errorMsg.classList.remove('hide')
    else {
        errorMsg.classList.add('hide')
        navigateToTab(1, tabs)
    }
}

const handleSubmitConfirmAppointment = async e => {
    e.preventDefault()
    const RESERVE_URL = `${API_URL}/appointments/${selectedAppointment}`
    const requestOptions = {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationBody)
    }
    const response = await fetch(RESERVE_URL, requestOptions)
    console.log(response);
    navigateToTab(3, tabs)
}

const handleSubmitStudentData = e => {
    e.preventDefault()
    const formData = new FormData(e.target)
    reservationBody.student.name = formData.get('student-name')
    reservationBody.student.surname = formData.get('student-surname')
    reservationBody.student.grade = formData.get('school-year')
    reservationBody.student.topics = [formData.get('interest-topic')]
    reservationBody.tutor.name = formData.get('guardian-name')
    reservationBody.tutor.telephone = formData.get('guardian-telephone')
    reservationBody.tutor.email = formData.get('guardian-mail')
    const paragraphs = document.querySelectorAll('#confirm-appointment .paragraph')
    const errorMsg = document.querySelector('#form-contact-data .error')
    if (!isContactDataValid(formData)) {
        errorMsg.classList.add('hide')
        return
    }
    errorMsg.classList.remove('hide')
    paragraphs[1].innerText = `${reservationBody.student.name} ${reservationBody.student.surname}`
    paragraphs[2].innerText = reservationBody.student.grade
    paragraphs[3].innerText = reservationBody.tutor.name
    paragraphs[4].innerText = reservationBody.tutor.email
    paragraphs[5].innerText = reservationBody.tutor.telephone
    reservationBody.comments = formData.get('comments')
    navigateToTab(2, tabs)
}

const getMonthDays = (someday) => {
    const monthDays = []
    let currMonth = someday.getMonth()
    for (let i = 1; i < 32; i++) {
        someday.setDate(i)
        if(someday.getMonth() != currMonth)
            break
        monthDays.push(new Date(someday))
    }
    someday.setMonth(currMonth)
    someday.setDate(15)
    return monthDays
}

const renderCalendar = async (days) => {
    const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const calendar = document.getElementById('calendar')
    const lastDate = days[days.length-1]
    calendar.innerHTML = `<div class="month-head flexbox"><button type="button" id="btn-previous-month"><img src="../img/icons/left-arrow.svg" alt="Mes anterior"></button><h5>${MONTHS[lastDate.getMonth()]} ${lastDate.getFullYear()}</h5><button type="button" id="btn-next-month"><img src="../img/icons/left-arrow.svg" alt="Mes siguiente"></button></div><h6 class="weekday">dom</h6><h6 class="weekday">lun</h6><h6 class="weekday">mar</h6><h6 class="weekday">mié</h6><h6 class="weekday">jue</h6><h6 class="weekday">vie</h6><h6 class="weekday">sáb</h6>`
    const availableAppointments = await fetchAvailableAppointments()
    console.log(availableAppointments);
    for (const day of days) {
        const dayElement = document.createElement('div')
        dayElement.classList.add('calendar-day')
        const dayKey = day.toLocaleDateString()
        if (dayKey in availableAppointments)
            dayElement.addEventListener('click', () => {
                for (const button of calendar.querySelectorAll('.calendar-day'))
                    button.classList.remove('selected-day')
                dayElement.classList.add('selected-day')
                displayTimeButtons(availableAppointments[dayKey])
            })
        else
            dayElement.classList.add('unavailable-day')
        dayElement.innerHTML = `<p>${day.getDate()}</p>`
        calendar.appendChild(dayElement)
    }
    document.getElementById('btn-previous-month').addEventListener('click', () => {
        if (currMonthIndex > 1) {
            currMonthIndex--
            changeMonth(months, currMonthIndex)
        }
    })
    document.getElementById('btn-next-month').addEventListener('click', () => {
        if (currMonthIndex + 1 < months.length) {
            currMonthIndex++
            changeMonth(months, currMonthIndex)
        }
    })
}

const navigateToTab = (tabIndex, tabs) => {
    for (const tab of tabs)
        tab.classList.add('hide')
    tabs[tabIndex].classList.remove('hide')
}

const fetchAvailableAppointments = async () => {
    let aux
    try {
        const response = await fetch(`${API_URL}/appointments/available`)
        aux = await response.json()
    } catch (error) {
        console.error(error)
    }
    const availableAppointments = {}
    for (const appointment of aux) {
        const appointmentStart = new Date(appointment.start)
        const appointmentDay = appointmentStart.toLocaleDateString()
        if (!(appointmentDay in availableAppointments))
            availableAppointments[appointmentDay] = []
        const appointmentData = {
            id: appointment.id,
            start: shortTimeFormatter.format(appointmentStart)
        }
        availableAppointments[appointmentDay].push(appointmentData)
    }
    return availableAppointments
}

const displayTimeButtons = (appointments) => {
    const timesContainer = document.getElementById('times-container')
    timesContainer.innerHTML = ''
    for (let i = 0; i < appointments.length; i++) {
        const appointmentData = appointments[i]
        timesContainer.innerHTML += `<input form="form-select-time" type="radio" name="time-button" class="available-time" id="time-btn-${i}" value="${appointmentData.id}"><label for="time-btn-${i}" class="available-time">${appointmentData.start}</label>`
    }
}

const isContactDataValid = (contactData) => {
    if (reservationBody.student.name.length < 3 || reservationBody.student.name.length > 50)
        return false
    if (reservationBody.student.surname.length < 3 || reservationBody.student.surname.length > 50)
        return false
    return true
}

const reservationBody = {
    student: {},
    tutor: {},
    comments: ''
}
let selectedAppointment
const tabs = [
    document.getElementById('select-date'),
    document.getElementById('contact-data'),
    document.getElementById('confirm-appointment'),
    document.getElementById('appointment-status'),
]
const shortTimeFormatter = new Intl.DateTimeFormat("en", {
    timeStyle: "short",
    hour12: false
  });
let someday = new Date()
let currMonth = someday.getMonth()
const currMonthDays = getMonthDays(someday)
someday.setMonth(currMonth-1)
const lastMonthDays = getMonthDays(someday)
someday.setMonth(currMonth+1)
const nextMonthDays = getMonthDays(someday)
const months = [lastMonthDays, currMonthDays, nextMonthDays]
let currMonthIndex = 1
changeMonth(months, currMonthIndex)
document.getElementById('form-select-time').addEventListener('submit', handleSubmitAppointmentTime)
document.getElementById('form-contact-data').addEventListener('submit', handleSubmitStudentData)
document.getElementById('return-from-contact-data').addEventListener('click', () => navigateToTab(0, tabs))
document.getElementById('return-from-confirm-appointment').addEventListener('click', () => navigateToTab(1, tabs))
document.getElementById('form-confirm-appointment').addEventListener('submit', handleSubmitConfirmAppointment)
navigateToTab(0, tabs)
