function studentCard(selectedValue, studentContainer) {
  // Use a live collection to track student cards
  const students = studentContainer.children;

  // Remove extra student cards if the current count exceeds the selected value
  while (students.length > selectedValue) {
    studentContainer.removeChild(students[students.length - 1]);
  }

  // Append new student cards if the current count is less than the selected value
  for (let i = students.length + 1; i <= selectedValue; i++) {
    const studentDiv = document.createElement("div");
    studentDiv.classList.add("student");

    studentDiv.innerHTML = `
        <p>الطالب ${String(i).padStart(2, "0")}:</p>
        <div class="S-info">
          <label for="name-${i}">الاسم واللقب:
            <input type="text" name="name-${i}" id="name-${i}" placeholder="full name" required>
          </label>
          <label for="numero-${i}">رقم الهاتف:
            <input type="text" name="numero-${i}" id="numero-${i}" placeholder="phone number" required>
          </label>
          <label for="email-${i}">البريد الالكتروني:
            <input type="email" name="email-${i}" id="email-${i}" placeholder="email" required>
          </label>
          <div class="niveau">
            <label for="M2-${i}">M2: <input type="radio" name="level-${i}" id="M2-${i}" value="M2"></label>
            <label for="L3-${i}">L3: <input type="radio" name="level-${i}" id="L3-${i}" value="L3" checked></label>
            <p>المستوى:</p>
          </div>
        </div>
      `;

    studentContainer.appendChild(studentDiv);
  }
}

// Function to handle the number of students logic
function numberOfStudents(NumberStudents, studentContainer) {
  NumberStudents.forEach((input) => {
    input.addEventListener("change", () => {
      const selectedValue = parseInt(input.value); // Get the selected number of students

      studentCard(selectedValue, studentContainer); // Call the function to create student cards
    });
  });
}

// Function to dynamically generate or remove supervisor cards
function supervisorCard(selectedValue, supervisorContainer) {
  // Use a live collection to track supervisor cards
  const supervisors = supervisorContainer.children;

  // Remove extra supervisor cards if the current count exceeds the selected value
  while (supervisors.length > selectedValue) {
    supervisorContainer.removeChild(supervisors[supervisors.length - 1]);
  }

  // Append new supervisor cards if the current count is less than the selected value
  for (let i = supervisors.length + 1; i <= selectedValue; i++) {
    const supervisorDiv = document.createElement("div");
    supervisorDiv.classList.add("supervisor");

    supervisorDiv.innerHTML = `
        <p>الأستاذ ${String(i).padStart(2, "0")}:</p>
        <div class="S-info">
          <label for="supervisor-name-${i}">الاسم واللقب:
            <input type="text" name="supervisor-name-${i}" id="supervisor-name-${i}" placeholder="full name" required>
          </label>
          <label for="supervisor-numero-${i}">رقم الهاتف:
            <input type="text" name="supervisor-numero-${i}" id="supervisor-numero-${i}" placeholder="phone number">
          </label>
          <label for="supervisor-email-${i}">البريد الالكتروني:
            <input type="email" name="supervisor-email-${i}" id="supervisor-email-${i}" placeholder="email" required>
          </label>
        </div>
      `;

    supervisorContainer.appendChild(supervisorDiv);
  }
}

// Function to handle the number of supervisors logic
function numberOfSupervisors(NumberSupervisors, supervisorContainer) {
  NumberSupervisors.forEach((input) => {
    input.addEventListener("change", () => {
      const selectedValue = parseInt(input.value); // Get the selected number of supervisors

      supervisorCard(selectedValue, supervisorContainer); // Call the function to create supervisor cards
    });
  });
}

// Function to handle faculties and their cards logic
function handleFaculties() {
    const faculties = document.querySelectorAll('input[name="faculty"]');
    const facultyCards = document.querySelectorAll(".faculties-cards .card");

    // Add event listeners to all faculty radio buttons
    faculties.forEach((faculty) => {
        faculty.addEventListener("change", () => {
            if (faculty.checked) {
                // Hide all faculty cards
                facultyCards.forEach((card) => {
                    card.classList.remove("active"); // Remove the active class
                });

                // Find the card corresponding to the selected faculty
                const selectedCard = document.querySelector(`.${faculty.value}-faculty.card`);
                if (selectedCard) {
                    // Display the selected card by adding the active class
                    selectedCard.classList.add("active");

                    // Check the first input in the selected card
                    const firstInput = selectedCard.querySelector('input[type="radio"]');
                    if (firstInput) {
                        firstInput.checked = true;
                    }
                }
            }
        });
    });

    // Initialize the first faculty card on page load
    const initialFaculty = document.querySelector('input[name="faculty"]:checked');
    if (initialFaculty) {
        const initialCard = document.querySelector(`.${initialFaculty.value}-faculty.card`);
        if (initialCard) {
            initialCard.classList.add("active"); // Add the active class

            // Check the first input in the initial card
            const firstInput = initialCard.querySelector('input[type="radio"]');
            if (firstInput) {
                firstInput.checked = true;
            }
        }
    }
}

// Attach the function to the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", (_) => {
  const NumberStudents = document.querySelectorAll(
    "input[name='number-of-students']"
  );
  const NumberSupervisors = document.querySelectorAll(
    "input[name='number-of-supervisors']"
  );

  const supervisorContainer = document.querySelector(".supervisors-info");
  const studentContainer = document.querySelector(".students-info");

  // initialize the student cards
  studentCard(NumberStudents[0].value, studentContainer);
  // Initialize the supervisor cards
  supervisorCard(NumberSupervisors[0].value, supervisorContainer);

  // Call the function to handle the number of students logic
  numberOfStudents(NumberStudents, studentContainer);
  // Call the function to handle the number of supervisors logic
  numberOfSupervisors(NumberSupervisors, supervisorContainer);
  // departement and faculties management function 
  handleFaculties();
});
