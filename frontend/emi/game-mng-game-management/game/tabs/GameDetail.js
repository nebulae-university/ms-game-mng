import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { FuseLoading } from '@fuse';

const useStyles = makeStyles({
    root: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
});

export default function GameDetail(props) {
    const { readGameDetailsResult } = props;

    const [gameDetail, setGameDetail] = useState(null);

    const classes = useStyles();
    const bull = <span className={classes.bullet}>•</span>;

    useEffect(() => {
        if (readGameDetailsResult.data){
            setGameDetail(readGameDetailsResult.data.GameMngGameDetails);
            console.log("GameDetail gameDetail:", JSON.stringify(readGameDetailsResult.data.GameMngGameDetails));
        }            
    }, [readGameDetailsResult])

    // Shows the Loading bar if we are waiting for something mandatory
    if (readGameDetailsResult.loading) {
        return (<FuseLoading />);
    }

    if (!gameDetail) {
        return (
            <Card className={classes.root}>
                <CardContent>
                    <Typography variant="h6" component="h2">
                        No game details available
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography variant="h4" component="h1" gutterBottom>
                    {gameDetail.title}
                </Typography>
                
                {gameDetail.thumbnail && (
                    <img 
                        src={gameDetail.thumbnail} 
                        alt={gameDetail.title}
                        style={{ maxWidth: '100%', height: 'auto', marginBottom: '16px' }}
                    />
                )}
                
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Game Information
                </Typography>
                
                <Typography variant="body1" className={classes.pos}>
                    <strong>Status:</strong> {gameDetail.status}
                </Typography>
                
                {gameDetail.genre && (
                    <Typography variant="body1" className={classes.pos}>
                        <strong>Genre:</strong> {gameDetail.genre}
                    </Typography>
                )}
                
                {gameDetail.platform && (
                    <Typography variant="body1" className={classes.pos}>
                        <strong>Platform:</strong> {gameDetail.platform}
                    </Typography>
                )}
                
                {gameDetail.publisher && (
                    <Typography variant="body1" className={classes.pos}>
                        <strong>Publisher:</strong> {gameDetail.publisher}
                    </Typography>
                )}
                
                {gameDetail.developer && (
                    <Typography variant="body1" className={classes.pos}>
                        <strong>Developer:</strong> {gameDetail.developer}
                    </Typography>
                )}
                
                {gameDetail.shortDescription && (
                    <Typography variant="body2" component="p" className={classes.pos}>
                        <strong>Short Description:</strong> {gameDetail.shortDescription}
                    </Typography>
                )}
                
                {gameDetail.description && (
                    <Typography variant="body2" component="p" className={classes.pos}>
                        <strong>Description:</strong> {gameDetail.description}
                    </Typography>
                )}
                
                {gameDetail.screenshots && gameDetail.screenshots.length > 0 && (
                    <>
                        <Typography className={classes.title} color="textSecondary" gutterBottom style={{ marginTop: '24px' }}>
                            Screenshots
                        </Typography>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {gameDetail.screenshots.map((screenshot, index) => (
                                <img
                                    key={screenshot.id || index}
                                    src={screenshot.image}
                                    alt={`${gameDetail.title} screenshot ${index + 1}`}
                                    style={{ 
                                        maxWidth: '300px', 
                                        height: 'auto',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}