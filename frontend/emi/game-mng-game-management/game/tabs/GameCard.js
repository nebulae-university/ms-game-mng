import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
});

export default function GameCard() {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="JavaScript Logo"
          height="140"
          image="/assets/mfe/game-mng-game-management/JavaScript-logo.png"
          title="JavaScript Logo"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            JavaScript
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            JavaScript is a high-level, often just-in-time compiled language that conforms to the ECMAScript specification.
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          Share
        </Button>
        <Button size="small" color="primary">
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
}
