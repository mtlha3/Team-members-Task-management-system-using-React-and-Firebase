import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut, updatePassword } from "firebase/auth";
import Swal from "sweetalert2";
import "tailwindcss/tailwind.css";
import { useNavigate } from "react-router-dom";

const ControlPanel = () => {
  const [teams, setTeams] = useState([]);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [tasks, setTasks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/adminlogin");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teams"), (snapshot) => {
      const fetchedTeams = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeams(fetchedTeams);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateTeam = async () => {
    Swal.fire({
      title: "Create a Team",
      html: `
        <input type="text" id="team-name" class="swal2-input" placeholder="Team Name" />
        <input type="text" id="team-purpose" class="swal2-input" placeholder="Team Purpose" />
      `,
      preConfirm: () => {
        const name = document.getElementById("team-name").value;
        const purpose = document.getElementById("team-purpose").value;

        if (!name || !purpose) {
          Swal.showValidationMessage("Please fill in all fields");
          return;
        }

        return { name, purpose };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await addDoc(collection(db, "teams"), {
            teamName: result.value.name,
            teamPurpose: result.value.purpose,
            members: [],
          });

          Swal.fire("Team Created!", `Team: ${result.value.name}`, "success");
        } catch (error) {
          console.error("Error creating team:", error);
          Swal.fire("Error", "There was a problem creating the team", "error");
        }
      }
    });
  };

  const handleAddMember = async () => {
    Swal.fire({
      title: "Add a Member",
      html: `
        <div class="flex flex-col space-y-4">
          <input type="text" id="member-name" class="swal2-input" placeholder="Member Name" />
          <input type="text" id="member-designation" class="swal2-input" placeholder="Member Designation" />
          <div>
            <select id="select-team" class="swal2-input w-full mx-3">
              <option value="" disabled selected>Select Team</option>
              ${teams.map((team) => `<option value="${team.teamName}">${team.teamName}</option>`).join("")}
            </select>
          </div>
        </div>
      `,
      preConfirm: () => {
        const name = document.getElementById("member-name").value;
        const designation = document.getElementById("member-designation").value;
        const team = document.getElementById("select-team").value;

        if (!name || !designation || !team) {
          Swal.showValidationMessage("Please fill in all fields");
          return;
        }

        return { name, designation, team };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const teamDoc = teams.find((team) => team.teamName === result.value.team);
        if (teamDoc) {
          const teamRef = doc(db, "teams", teamDoc.id);
          const updatedMembers = [...teamDoc.members, { memberName: result.value.name, memberDesignation: result.value.designation }];
          await updateDoc(teamRef, { members: updatedMembers });
          setTeams((prevTeams) => prevTeams.map((team) => (team.id === teamDoc.id ? { ...team, members: updatedMembers } : team)));
          Swal.fire("Member Added!", `Member: ${result.value.name}`, "success");
        }
      }
    });
  };

  const handleDeleteMember = async (teamId, memberIndex) => {
    const team = teams.find((t) => t.id === teamId);
    if (team) {
      const updatedMembers = team.members.filter((_, index) => index !== memberIndex);
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, { members: updatedMembers });
      setTeams((prevTeams) => prevTeams.map((t) => (t.id === teamId ? { ...t, members: updatedMembers } : t)));
    }
  };

  const handleDeleteTeam = async (teamId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteDoc(doc(db, "teams", teamId));
        setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
        Swal.fire("Deleted!", "The team has been deleted.", "success");
      }
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/adminlogin");
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleChangePassword = async () => {
    if (!user) {
      Swal.fire("Error", "No user is currently logged in.", "error");
      return;
    }

    const { value: newPasswordInput } = await Swal.fire({
      title: "Change Password",
      input: "password",
      inputLabel: "New Password",
      inputPlaceholder: "Enter new password",
      showCancelButton: true,
      confirmButtonText: "Change Password",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter a new password!";
        }
        setNewPassword(value);
        return null;
      },
    });

    if (newPasswordInput) {
      try {
        await updatePassword(user, newPasswordInput);
        Swal.fire("Success!", "Your password has been changed.", "success");
      } catch (error) {
        Swal.fire("Error!", error.message, "error");
      }
    }
  };

  const handleAssignTask = (memberName) => {
    Swal.fire({
      title: "Assign Task",
      input: "text",
      inputLabel: `Assign a task to ${memberName}`,
      inputPlaceholder: "Enter task description",
      showCancelButton: true,
      confirmButtonText: "Assign Task",
      preConfirm: (taskDescription) => {
        if (!taskDescription) {
          Swal.showValidationMessage("Please enter a task description");
        }
        return taskDescription;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const currentTasks = tasks[memberName] || [];
        const updatedTasks = [...currentTasks, result.value];
        setTasks((prevTasks) => ({ ...prevTasks, [memberName]: updatedTasks }));
        Swal.fire("Task Assigned!", `Task assigned to ${memberName}: ${result.value}`, "success");
      }
    });
  };

  const handleViewTaskSheet = () => {
    const taskSheetHtml = Object.entries(tasks)
      .map(([member, taskList]) => `
        <h4 class="font-bold">${member}</h4>
        <ul class="list-disc ml-5">
          ${taskList.map((task) => `<li>${task}</li>`).join("")}
        </ul>
      `)
      .join("");

    Swal.fire({
      title: "Task Sheet",
      html: `<div class="space-y-4">${taskSheetHtml || "<p>No tasks assigned yet.</p>"}</div>`,
      showCloseButton: true,
    });
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Control Panel</h1>
        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="focus:outline-none">
            <img src="download.png" alt="User" className="w-8 h-8 rounded-full" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <button onClick={handleChangePassword} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left">
                Change Password
              </button>
              <button onClick={handleLogout} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex mb-4 space-x-4">
        <button onClick={handleCreateTeam} className="bg-blue-500 text-white px-4 py-2 rounded">Create a Team</button>
        <button onClick={handleAddMember} className="bg-green-500 text-white px-4 py-2 rounded">Add a Member</button>
        <button onClick={handleViewTaskSheet} className="bg-indigo-500 text-white px-4 py-2 rounded">Task Sheet</button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Teams</h2>
        {teams.length === 0 ? (
          <p>No teams available.</p>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="border p-4 mb-4 rounded shadow">
              <h3 className="font-bold text-lg">{team.teamName}</h3>
              <p>{team.teamPurpose}</p>
              <h4 className="font-bold mt-2">Members:</h4>
              {team.members.length > 0 ? (
                team.members.map((member, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span>{member.memberName} ({member.memberDesignation})</span>
                    <div className="flex space-x-2">
                      <button onClick={() => handleAssignTask(member.memberName)} className="bg-yellow-500 text-white px-2 py-1 rounded">Assign Task</button>
                      <button onClick={() => handleDeleteMember(team.id, index)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No members in this team.</p>
              )}
              <button onClick={() => handleDeleteTeam(team.id)} className="bg-red-700 text-white px-4 py-2 rounded">Delete Team</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
