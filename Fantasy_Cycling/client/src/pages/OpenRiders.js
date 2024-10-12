import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRiders } from "../store/slices/riderSlice";
import { updateRoster } from "../store/slices/teamSlice";
import RiderList from "../components/RiderList";

const OpenRiders = () => {
  const dispatch = useDispatch();
  const { riders, loading } = useSelector((state) => state.riders);
  const { teams } = useSelector((state) => state.teams);
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchRiders());
  }, [dispatch]);

  useEffect(() => {
    const allTeamRiders = teams
      .flatMap((team) => [
        team.active_gc_rider,
        ...team.active_domestiques,
        ...team.bench_gc_riders,
        ...team.bench_domestiques,
      ])
      .map((rider) => rider.id);
    setFilteredRiders(
      riders.filter((rider) => !allTeamRiders.includes(rider.id))
    );
  }, [riders, teams]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDraft = (rider) => {
    // Assuming the user has only one team for simplicity
    const userTeam = teams[0];
    if (userTeam && userTeam.trades_left > 0) {
      // ... (rest of the draft logic)
      dispatch(
        updateRoster({
          teamId: userTeam.id,
          rosterData: newRoster,
        })
      );
    } else {
      alert("You don't have any trades left or you don't have a team yet.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const displayRiders = searchTerm
    ? filteredRiders.filter(
        (rider) =>
          rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rider.team.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredRiders;

  return (
    <div className="open-riders">
      <h1>Available Riders</h1>
      <input
        type="text"
        placeholder="Search riders or teams"
        value={searchTerm}
        onChange={handleSearch}
      />
      <RiderList riders={displayRiders} onDraft={handleDraft} />
    </div>
  );
};

export default OpenRiders;