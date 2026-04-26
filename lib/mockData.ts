const mockData = {
  users: [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com' }
  ],
  tasks: [
    { id: 1, title: 'Task 1', completed: false },
    { id: 2, title: 'Task 2', completed: true }
  ],
  chats: [
    { id: 1, message: 'Hello!', sender: 'User' },
    { id: 2, message: 'Hi there!', sender: 'AI' }
  ],
  dashboard: {
    stats: {
      totalUsers: 100,
      totalTasks: 50
    }
  },
  quizzes: [
    { id: 1, question: 'What is 2 + 2?', options: ['3', '4', '5'], answer: '4' }
  ],
  events: [
    { id: 1, title: 'Study Session', date: '2026-04-27' }
  ]
};

export default mockData;