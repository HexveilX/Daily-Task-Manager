
# 📝 Daily Task Manager

A modern and minimal web app to help users manage their daily tasks, stay organized, and boost productivity. Built with simplicity in mind, this project offers essential task management features using modern web technologies.

---

## 🚀 Features

- ✅ Add, edit, and delete tasks
- 📅 Set due dates and priorities
- 🌓 Light/Dark mode support (optional)
- 🛎️ Reminders and notifications (optional)
- 📋 Clean and responsive UI
- 🔍 View tasks by date or priority
- 📦 Data storage with Firebase

---

## 🖥️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Optional: React + Tailwind CSS)
- **Backend / Database:** Firebase (Authentication + Firestore)
- **Hosting:** Firebase Hosting / GitHub Pages (optional)

---


## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/HexveilX/daily-task-manager.git

# Open the folder
cd daily-task-manager

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your Supabase credentials

# Start the development server
npm run dev

# Open index.html in your browser (if using plain JS)
# OR
# Run your development server if using React (Vite / Create React App / etc.)
```

## 🔑 Environment Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the Supabase migrations to set up the database schema

---

## 🧠 What I Learned

- Firebase Authentication & Firestore integration
- UI/UX principles and responsive design
- State management and data binding
- Date formatting and modal design

---

## 🙋‍♂️ Author

- **Name:** Zyad  
- **GitHub:** [@HexveilX](https://github.com/HexveilX)

---

## 📃 License

This project is licensed under the [MIT License](LICENSE).

---

## 💡 Future Improvements

- ✅ Add user accounts with username
- ✅ Drag and drop task sorting
- ✅ Custom themes
- ✅ Mobile-first experience
