import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    databaseURL: "https://pray-20000-default-rtdb.firebaseio.com",
    projectId: "pray-20000"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {
    // Display random verse on page load
    displayRandomVerse();

    // Handle "Need Prayer" button click to show/hide prayer form
    const prayerForm = document.getElementById("prayer-form");
    const needPrayerButton = document.getElementById("needPrayerButton");
    needPrayerButton.addEventListener("click", function() {
        prayerForm.classList.toggle("hidden");
    });

    // Handle prayer request form submission
    prayerForm.addEventListener("submit", function(event) {
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
                timestamp: new Date().toISOString()
            })
            .then(() => {
                prayerForm.reset();
                prayerForm.classList.add('hidden');
                alert("Prayer request submitted!");
                window.location.href = "support.html";
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error submitting prayer request.');
            });
        } else {
            alert("Please fill in all required fields.");
        }
    });

    // Display random Bible verse
    function displayRandomVerse() {
        const verses = [
            { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", book_name: "Philippians", chapter: 4, verse: 6 },
            { text: "For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.", book_name: "Jeremiah", chapter: 29, verse: 11 }
        ];

        const randomIndex = Math.floor(Math.random() * verses.length);
        const randomVerse = verses[randomIndex];
        const verseContainer = document.getElementById('daily-verse');
        
        if (verseContainer) {
            verseContainer.innerHTML = `"${randomVerse.text}" - ${randomVerse.book_name} ${randomVerse.chapter}:${randomVerse.verse}`;
        } else {
            console.error("daily-verse element not found!");
        }
    }

    // Testimonies carousel
    const testimonials = [
        "“I prayed for healing, and God answered my prayers!” – John D.",
        "“I felt God's presence during a tough time.” – Sarah L.",
        "“Prayer changed my life in ways I never imagined.” – Mark R."
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
