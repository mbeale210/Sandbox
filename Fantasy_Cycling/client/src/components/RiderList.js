import React from "react";

const RiderList = ({ riders, onDraft, onRemove }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Team</th>
          <th>Points</th>
          <th>Type</th>
          {onDraft && <th>Action</th>}
          {onRemove && <th>Remove</th>}
        </tr>
      </thead>
      <tbody>
        {riders.map((rider) => (
          <tr key={rider.id}>
            <td>{rider.name}</td>
            <td>{rider.team}</td>
            <td>{rider.points}</td>
            <td>{rider.is_gc ? "GC" : "Domestique"}</td>
            {onDraft && (
              <td>
                <button onClick={() => onDraft(rider)}>Draft</button>
              </td>
            )}
            {onRemove && (
              <td>
                <button onClick={() => onRemove(rider.id)}>Remove</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RiderList;
