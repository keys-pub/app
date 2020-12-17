import * as React from 'react'

import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  CardMedia,
  FormControl,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core'

import Header from '../../header'
import Logo from '../../logo'
import AuthRecover from '../recover'
import AuthReset from '../reset'
import Link from '../../components/link'
import Dialog from '../../components/dialog'

type Props = {
  close: () => void
}

export default (props: Props) => {
  const [step, setStep] = React.useState('')

  const close = () => {
    setStep('')
    props.close()
  }

  switch (step) {
    case 'recover':
      return <AuthRecover close={close} />
    case 'reset':
      return <AuthReset close={close} />
  }

  return (
    <Box display="flex" flexGrow={1} flexDirection="column">
      <Header noBack />
      <Logo top={100} />
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center">
        <Card style={{marginBottom: 20, width: 400}}>
          <CardActionArea onClick={() => setStep('recover')}>
            <CardContent>
              <Typography gutterBottom variant="h5" color="primary">
                Recover
              </Typography>
              <Typography variant="body1" color="textSecondary" component="p">
                Use your paper key to create a new password.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card style={{marginBottom: 20, width: 400}}>
          <CardActionArea onClick={() => setStep('reset')}>
            <CardContent>
              <Typography gutterBottom variant="h5" color="primary">
                Reset
              </Typography>
              <Typography variant="body1" color="textSecondary" component="p">
                Reset everything and start over.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Link onClick={close}>Go back</Link>
      </Box>
    </Box>
  )
}
