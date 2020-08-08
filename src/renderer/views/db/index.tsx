import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  Drawer,
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
import {collections, documents} from '../../rpc/keys'
import {
  RPCError,
  Collection,
  Document,
  CollectionsRequest,
  CollectionsResponse,
  DocumentsRequest,
  DocumentsResponse,
} from '../../rpc/keys.d'

type Props = {
  db: string
}

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
    const req: CollectionsRequest = {
      db: this.props.db,
    }
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
      prefix: col.path + '/',
      db: this.props.db,
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
      <Box display="flex" flexDirection="row" style={{position: 'relative', height: '100%'}}>
        <Table size="small" style={{position: 'sticky', left: 0, top: 30, width: 100}}>
          <TableBody>
            {collections.map((col, index) => (
              <TableRow
                hover
                onClick={(event) => this.selectCollection(col)}
                key={col.path}
                style={{cursor: 'pointer'}}
              >
                <TableCell style={{paddingLeft: 8, paddingRight: 8}}>
                  <Typography style={{...styles.mono, fontSize: 11}}>{col.path}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Divider orientation="vertical" />
        <Table size="small">
          <TableBody>
            {documents.map((doc: Document, index: number) => (
              <TableRow hover onClick={(event) => this.selectDocument(doc)} key={doc.path}>
                <Box style={{paddingLeft: 8, paddingTop: 8, paddingBottom: 8}}>
                  <Typography style={{...styles.mono, fontSize: 11, wordBreak: 'break-all', color: '#666'}}>
                    {doc.path}
                  </Typography>
                  <Typography style={{...styles.mono, fontSize: 11, wordBreak: 'break-all'}}>
                    {doc.value}
                  </Typography>
                  <Typography style={{...styles.mono, fontSize: 11, wordBreak: 'break-all'}}>
                    {dateString(doc.createdAt)}
                  </Typography>
                  <Typography style={{...styles.mono, fontSize: 11, wordBreak: 'break-all'}}>
                    {dateString(doc.updatedAt)}
                  </Typography>
                </Box>
                <Divider />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    )
  }
}
