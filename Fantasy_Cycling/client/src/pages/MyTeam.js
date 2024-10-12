import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchUserTeams, addRiderToTeam } from "../store/slices/teamSlice";
import api from "../services/api";

const MyTeam = () => {
  const { teamId } = useParams();
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.teams);
  const [availableRiders, setAvailableRiders] = useState([]);
  const team = teams.find((t) => t.id.toString() === teamId);

  useEffect(() => {
    dispatch(fetchUserTeams());

    // Fetch available riders to add to team
    const fetchAvailableRiders = async () => {
      try {
        const response = await api.get("/riders/rankings");
        setAvailableRiders(response.data);
      } catch (err) {
        console.error("Failed to fetch riders.");
      }
    };

    fetchAvailableRiders();
  }, [dispatch]);

  const handleAddRider = async (riderId) => {
    try {
      await dispatch(addRiderToTeam({ teamId: team.id, riderId }));
      alert("Rider added to team successfully!");
    } catch (err) {
      console.error("Error adding rider to team", err);
    }
  };

  if (loading) return <div>Loading team...</div>;
  if (!team) return <div>Team not found</div>;

  return (
    <div className="my-team">
      <h1>{team.name}</h1>
      <p>Total Points: {team.sprint_pts + team.mountain_pts}</p>
      <p>Trades Left: {team.trades_left}</p>

      <h2>Riders on Team</h2>
      {team.riders.map((rider) => (
        <p key={rider.id}>{rider.name}</p>
      ))}

      <h2>Add a Rider</h2>
      {availableRiders.map((rider) => (
        <button key={rider.id} onClick={() => handleAddRider(rider.id)}>
          {rider.name}
        </button>
      ))}
    </div>
  );
};

export default MyTeam;
