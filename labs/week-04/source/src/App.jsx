import { initialTasks } from './data/initialTasks.js';
import AppHeader from './components/AppHeader.jsx';
import SummryPanel from './components/AppHeader.jsx';
import TaskCard from './components/AppHeader.jsx';
import TaskList from './components/AppHeader.jsx';

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

