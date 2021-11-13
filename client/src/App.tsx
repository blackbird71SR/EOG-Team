import AppBar from '@material-ui/core/AppBar';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { ClientRequest, processRequest, ServerRequest, ServerResponse } from './optimization';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
    body: {
      padding: theme.spacing(2),
    },
  }),
);

function App() {
  const classes = useStyles();

  const [request, setRequest] = React.useState<null | ServerRequest>(null);
  const [result, setResult] = React.useState<null | ServerResponse>(null);
  const [response, setResponse] = React.useState<null | ClientRequest>(null);

  React.useEffect(() => {
    const ws = new WebSocket('ws://localhost:9172');

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({setPitCapacity: 100000}));
    })

    // When the server sends new data, we send how to optimally allocate the water
    ws.addEventListener('message', function incoming(message) {
      
      if (message.data.startsWith('Error')) {
        window.alert(message.data);
        throw Error(message.data)
      }

      const data = JSON.parse(message.data);
      if (data.type === "CURRENT_STATE") {
        const request: ServerRequest = JSON.parse(message.data);
        setRequest(request);
        const response = processRequest(request)
        setResponse(response)
        ws.send(JSON.stringify(response));
      } else if (data.type === "OPTIMATION_RESULT") {
        const response: ServerResponse = JSON.parse(message.data);
        setResult(response);
      }
    });
    
    // Oh no! Something unexpected happened.
    ws.addEventListener('error', function error(event) {
      throw Error(JSON.stringify(event));
    })

    return function cleanup() {
      ws.close();
    }
  }, [])

  return (
    <div>
     <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" className={classes.title}>
            UTD Hackathon
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.body}>
        <div>1.) Server Sends Current State of the System:</div>
        <textarea id="w3review" name="w3review" rows={10} cols={150} value={JSON.stringify(request, undefined, 2)}/>
        <div>2.) Client Sends Solution to the Optimization:</div>
        <textarea id="w3review" name="w3review" rows={10} cols={150} value={JSON.stringify(response, undefined, 2)}/>
        <div>3.) Server Sends Result:</div>
        <textarea id="w3review" name="w3review" rows={10} cols={150} value={JSON.stringify(result, undefined, 2)}/>
      </div>
    </div>
  );
}

export default App;
