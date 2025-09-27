import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { auth } from '/JavaScript/firebase-config.js';

const db = getFirestore();
let currentUser = null;
let currentNoteId = null; // To track which note is being edited

// DOM Elements
const notesGridView = document.getElementById('notes-grid-view');
const noteEditorView = document.getElementById('note-editor-view');
const notesContainer = document.getElementById('notes-container');
const addNoteCard = document.getElementById('add-note-card');
const backBtn = document.getElementById('back-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const deleteNoteBtn = document.getElementById('delete-note-btn');
const noteTitleInput = document.getElementById('note-title-input');
const noteContentInput = document.getElementById('note-content-input');
const createdDateEl = document.getElementById('created-date');
const editedDateEl = document.getElementById('edited-date');

// --- Authentication ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadNotes();
    } else {
        window.location.href = "/Login-signup/login.html";
    }
});

// --- View Switching ---
function showGridView() {
    noteEditorView.classList.add('hidden');
    notesGridView.classList.remove('hidden');
    currentNoteId = null;
    noteTitleInput.value = '';
    noteContentInput.value = '';
    createdDateEl.textContent = '';
    editedDateEl.textContent = '';
}

function showEditorView(note = null) {
    if (note) {
        currentNoteId = note.id;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        createdDateEl.textContent = `Created: ${formatTimestamp(note.createdAt)}`;
        editedDateEl.textContent = `Edited: ${formatTimestamp(note.lastEditedAt)}`;
    } else {
        // This is a new note
        currentNoteId = null;
        noteTitleInput.value = '';
        noteContentInput.value = '';
        createdDateEl.textContent = 'Creating a new note...';
        editedDateEl.textContent = '';
    }
    notesGridView.classList.add('hidden');
    noteEditorView.classList.remove('hidden');
}

// --- Load and Display Notes ---
function loadNotes() {
    if (!currentUser) return;
    const notesRef = collection(db, "users", currentUser.uid, "notes");
    const q = query(notesRef, orderBy("lastEditedAt", "desc"));

    onSnapshot(q, (snapshot) => {
        // Clear existing notes except the 'add' card
        document.querySelectorAll('.note-card:not(.add-note-card)').forEach(card => card.remove());

        snapshot.forEach(doc => {
            const note = { id: doc.id, ...doc.data() };
            renderNoteCard(note);
        });
    });
}

function renderNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.id = note.id;

    card.innerHTML = `
        <h3 class="note-card-title">${note.title || 'Untitled Note'}</h3>
        <p class="note-card-content">${note.content || 'No content...'}</p>
        <span class="note-card-date">Edited: ${formatTimestamp(note.lastEditedAt)}</span>
    `;

    // Add click listener to open the editor
    card.addEventListener('click', () => showEditorView(note));

    // Insert new notes before the "Add New Note" card
    notesContainer.insertBefore(card, addNoteCard);
}

// --- Save/Update Note ---
async function handleSaveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title && !content) {
        alert("Cannot save an empty note.");
        return;
    }

    const notesRef = collection(db, "users", currentUser.uid, "notes");

    if (currentNoteId) {
        // Update existing note
        const noteDoc = doc(db, "users", currentUser.uid, "notes", currentNoteId);
        await updateDoc(noteDoc, {
            title: title,
            content: content,
            lastEditedAt: serverTimestamp()
        });
    } else {
        // Create new note
        await addDoc(notesRef, {
            title: title,
            content: content,
            createdAt: serverTimestamp(),
            lastEditedAt: serverTimestamp()
        });
    }
    showGridView();
}

// --- Delete Note ---
async function handleDeleteNote() {
    if (!currentNoteId) {
        showGridView();
        return;
    }
    if (confirm("Are you sure you want to delete this note?")) {
        const noteDoc = doc(db, "users", currentUser.uid, "notes", currentNoteId);
        await deleteDoc(noteDoc);
        showGridView();
    }
}

// --- Event Listeners ---
addNoteCard.addEventListener('click', () => showEditorView(null));
backBtn.addEventListener('click', showGridView);
saveNoteBtn.addEventListener('click', handleSaveNote);
deleteNoteBtn.addEventListener('click', handleDeleteNote);


// --- Utility Function ---
function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.toDate) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}