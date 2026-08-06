import { initialTasks } from './data/initialTasks.js';

function App() {
  return (
    <>
      <AppHeader
        title="Study Task Board"
        subtitle="ฝึก React mental model ก่อนทำ LAB04"
  />



      <main className="container page-content">
       <SummryPanel/>
      </main>
    </>
  );
}

export default App;

