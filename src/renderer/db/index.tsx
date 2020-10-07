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

import Header from '../header'

import {dateString} from '../helper'
import {collections, documents} from '../rpc/keys'
import {
  Collection,
  Document,
  CollectionsRequest,
  CollectionsResponse,
  DocumentsRequest,
  DocumentsResponse,
} from '../rpc/keys.d'

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
      parent: '',
    }
    collections(req).then((resp: CollectionsResponse) => {
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
    documents(req).then((resp: DocumentsResponse) => {
      this.setState({
        documents: resp.documents || [],
      })
    })
  }

  selectDocument = (doc: Document) => {}

  render() {
    const {collections, documents} = this.state
    return (
      <Box display="flex" flexDirection="row" flex={1} style={{position: 'relative'}}>
        <Box style={{width: 90, paddingTop: 20}}>
          <Table size="small">
            <TableBody>
              {(collections as Collection[]).map((col, index) => (
                <TableRow
                  hover
                  onClick={(event) => this.selectCollection(col)}
                  key={col.path}
                  style={{cursor: 'pointer'}}
                >
                  <TableCell style={{paddingLeft: 8, paddingRight: 8}}>
                    <Typography variant="body2" style={{fontSize: 11}}>
                      {col.path}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Divider orientation="vertical" />
        <Box
          display="flex"
          flex={1}
          style={{position: 'absolute', top: 20, left: 90, bottom: 0, right: 0, overflow: 'auto'}}
        >
          <Table size="small">
            <TableBody>
              {documents.map((doc: Document, index: number) => (
                <TableRow hover onClick={(event) => this.selectDocument(doc)} key={doc.path}>
                  <TableCell>
                    <Box display="flex" flexDirection="column">
                      <Typography
                        variant="body2"
                        style={{fontSize: 11, wordBreak: 'break-all', color: '#666'}}
                      >
                        {doc.path}
                      </Typography>
                      <Typography variant="body2" style={{fontSize: 11, wordBreak: 'break-all'}}>
                        {doc.value}
                      </Typography>
                      <Typography variant="body2" style={{fontSize: 11, wordBreak: 'break-all'}}>
                        {dateString(doc.createdAt)}
                      </Typography>
                      <Typography variant="body2" style={{fontSize: 11, wordBreak: 'break-all'}}>
                        {dateString(doc.updatedAt)}
                      </Typography>
                    </Box>
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
