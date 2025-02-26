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

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    displayRandomVerse(); // Call the function here

    // Other initialization code...
});
