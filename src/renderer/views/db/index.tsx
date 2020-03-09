import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@material-ui/core'

import {connect} from 'react-redux'

import {styles} from '../../components'
import {dateString} from '../helper'
import {collections, documents} from '../../rpc/rpc'
import {
  RPCError,
  Collection,
  Document,
  CollectionsRequest,
  CollectionsResponse,
  DocumentsRequest,
  DocumentsResponse,
} from '../../rpc/types'

type Props = {}

type State = {
  collections: Array<Collection>
  documents: Array<Document>
}

export default class DBView extends React.Component<Props, State> {
  state = {
    collections: [],
    documents: [],
  }

  componentDidMount() {
    const req: CollectionsRequest = {}
    collections(req, (err: RPCError, resp: CollectionsResponse) => {
      if (err) {
        // TODO: error
        return
      }
      this.setState({
        collections: resp.collections || [],
        documents: [],
      })
    })
  }

  selectCollection = (col: Collection) => {
    this.setState({
      documents: [],
    })
    const req: DocumentsRequest = {
      path: col.path,
      prefix: '',
    }
    documents(req, (err: RPCError, resp: DocumentsResponse) => {
      if (err) {
        // TODO: error
        return
      }
      this.setState({
        documents: resp.documents || [],
      })
    })
  }

  selectDocument = (doc: Document) => {}

  render() {
    const {collections, documents} = this.state
    return (
      <Box display="flex" flexDirection="row" flex={1}>
        <Box display="flex" flexDirection="column" style={{width: 200}}>
          <Table size="small">
            {/*<TableHead>
                <TableRow>
                  <TableCell>
                    <Typography style={{...styles.mono}}>Path</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              */}
            <TableBody>
              {collections.map((col, index) => (
                <TableRow hover onClick={event => this.selectCollection(col)} key={col.path}>
                  <TableCell>
                    <Typography style={{...styles.mono}}>{col.path}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Box display="flex" flexDirection="column" flex={1}>
          <Table size="small">
            {/*<TableHead>
                <TableRow>
                  <TableCell>
                    <Typography style={{...styles.mono}}></Typography>
                  </TableCell>
                  <TableCell>
                    <Typography style={{...styles.mono}}></Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              */}
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow hover onClick={event => this.selectDocument(doc)} key={doc.path}>
                  <TableCell style={{width: 300, verticalAlign: 'top'}}>
                    <Typography style={{...styles.mono, wordBreak: 'break-all'}}>{doc.path}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography style={{...styles.mono, verticalAlign: 'top', wordBreak: 'break-all'}}>
                      {doc.value}
                    </Typography>
                    <Typography style={{...styles.mono, verticalAlign: 'top', wordBreak: 'break-all'}}>
                      {dateString(doc.createdAt)}
                    </Typography>
                    <Typography style={{...styles.mono, verticalAlign: 'top', wordBreak: 'break-all'}}>
                      {dateString(doc.updatedAt)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    )
  }
}
