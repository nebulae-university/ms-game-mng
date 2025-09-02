import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function GamesStatsModal(props) {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);
  const { open, setOpen, totalGames, averageMetascore, gamesByGenre } = props;


  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <h2 id="simple-modal-title">Game Statistics</h2>
      <p>Total Games: <strong>{totalGames}</strong></p>
  <p>Average Metascore: <strong>{typeof averageMetascore === 'number' ? averageMetascore.toFixed(2) : 'N/A'}</strong></p>
      <h3>Games by Genre</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Genre</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>Count</th>
          </tr>
        </thead>
        <tbody>
          {gamesByGenre && Object.entries(gamesByGenre).map(([genre, count]) => (
            <tr key={genre}>
              <td>{genre}</td>
              <td style={{ textAlign: 'right' }}>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
}
