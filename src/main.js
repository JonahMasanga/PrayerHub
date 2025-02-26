import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// Firebase configuration (replace with your actual Firebase config)
const firebaseConfig = {
    databaseURL: "https://pray-20000-default-rtdb.firebaseio.com",
    projectId: "pray-20000",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to fetch and display a random Bible verse
async function fetchRandomVerse() {
    try {
        const response = await fetch('https://bible-api.com/random');
        const data = await response.json();

        const verseText = data.text;
        const verseReference = data.reference;

        const verseContainer = document.getElementById('daily-verse');
        if (verseContainer) {
            verseContainer.innerHTML = `"${verseText}" - ${verseReference}`;
        } else {
            console.error("daily-verse element not found!");
        }
    } catch (error) {
        console.error("Error fetching verse:", error);
        const verseContainer = document.getElementById('daily-verse');
        if (verseContainer) {
            verseContainer.innerHTML = "Error loading verse. Please try again later.";
        }
    }
}

// Handle prayer form submission
document.addEventListener('DOMContentLoaded', function () {
    fetchRandomVerse(); // Fetch and display a random verse on page load

    const prayerForm = document.getElementById("prayer-form");
    const needPrayerButton = document.getElementById("needPrayerButton");

    // Toggle prayer form visibility
    if (needPrayerButton) {
        needPrayerButton.addEventListener("click", function () {
            if (prayerForm) {
                prayerForm.classList.toggle("hidden");
            }
        });
    }

    // Submit prayer request
    if (prayerForm) {
        prayerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value;
            const message = document.getElementById("prayer-request").value;
            const country = document.getElementById("country").value;

            if (name && message && country) {
                const prayerRequestsRef = ref(db, 'prayerRequests');
                const newRequestRef = push(prayerRequestsRef);

                set(newRequestRef, {
                    name: name,
                    prayer: message,
                    country: country,
                    timestamp: new Date().toISOString(),
                })
                    .then(() => {
                        prayerForm.reset();
                        if (prayerForm) prayerForm.classList.add('hidden');
                        alert("Prayer request submitted!");
                        window.location.href = "support.html"; // Redirect to support page
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        alert('Error submitting prayer request.');
                    });
            } else {
                alert("Please fill in all required fields.");
            }
        });
    }

    // Testimonials rotation
    const testimonials = [
        "“I prayed for healing, and God answered my prayers!” – John D.",
        "“I felt God's presence during a tough time.” – Sarah L.",
        "“Prayer changed my life in ways I never imagined.” – Mark R.",
    ];

    let index = 0;
    const testimonialText = document.getElementById("testimonial-text");

    if (testimonialText) {
        setInterval(() => {
            testimonialText.textContent = testimonials[index];
            index = (index + 1) % testimonials.length;
        }, 5000);
    }
});

// WhatsApp button functionality
function openWhatsApp() {
    const phoneNumber = "256788925048";
    const message = "Hello, I need assistance.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}
