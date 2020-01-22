import * as React from 'react'

import {Box, Divider, Typography} from '@material-ui/core'

// $FlowFixMe
import {AutoSizer, CellMeasurer, CellMeasurerCache, InfiniteLoader, List} from 'react-virtualized'

import {styles} from '../components'

import {documents, RPCState} from '../../rpc/rpc'
import {Document, DocumentsRequest, DocumentsResponse} from '../../rpc/types'

import {connect} from 'react-redux'

type Row = {
  doc: Document
}

type Cell = {
  index: number
  isScrolling: boolean
  key: any
  parent: any
  style: any
}

type RowLoaded = {
  index: number
}

type Range = {
  startIndex: number
  stopIndex: number
}

type Props = {
  path: string
  total: number
  dispatch: (action: any) => any
}

class DBVListView extends React.Component<Props> {
  list: Array<Row> = []
  cellCache: any

  constructor(props: Props) {
    super(props)
    this.cellCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 20,
    })
  }

  rowRenderer = (cell: Cell) => {
    const {index, isScrolling, key, parent, style} = cell
    const row = this.list[index]
    if (!row) return null
    return (
      <CellMeasurer
        cache={this.cellCache}
        columnIndex={0}
        key={row.doc.path}
        rowIndex={index}
        parent={parent}
      >
        <Box
          display="flex"
          flex={1}
          flexDirection="row"
          style={{
            ...style,
            backgroundColor: 'white',
          }}
        >
          <Box display="flex" flexDirection="column" flex={1}>
            <Box display="flex" flexDirection="row">
              <Typography
                style={{
                  ...styles.mono,
                  fontSize: 11,
                  paddingLeft: 8,
                  paddingTop: 6,
                  paddingBottom: 6,
                  width: 400,
                  minWidth: 400,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  wordBreak: 'break-all',
                  backgroundColor: '#fafafa',
                  borderRight: '1px solid #efefef',
                }}
              >
                {row.doc.path}
                {/* {row.entry.key.split(/(.*?\/)/g).map(t => (
                  <span>{t}</span>
                ))} */}
              </Typography>
              <Typography
                style={{
                  ...styles.mono,
                  fontSize: 11,
                  paddingTop: 4,
                  paddingBottom: 8,
                  paddingLeft: 8,
                  paddingRight: 5,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  wordBreak: 'break-all',
                }}
              >
                {row.doc.value}
              </Typography>
            </Box>
            <Divider />
          </Box>
        </Box>
      </CellMeasurer>
    )
  }

  isRowLoaded = (r: RowLoaded): boolean => {
    // console.log('isRowLoaded:', r)
    return !!this.list[r.index]
  }

  loadMoreRows = (r: Range): Promise<any> => {
    return new Promise((resolve, reject) => {
      const req: DocumentsRequest = {
        path: this.props.path,
        prefix: '',
        // index: r.startIndex,
        // length: r.stopIndex - r.startIndex + 1,
        // pretty: true,
      }
      this.props.dispatch(
        documents(req, (resp: DocumentsResponse) => {
          // TODO: Check if component was unmounted, cancel in componentWillUnmount
          let i = r.startIndex
          // $FlowFixMe
          for (const doc of resp.documents) {
            this.list[i++] = {doc}
          }
          resolve()
        })
      )
    })
  }

  render() {
    return (
      <InfiniteLoader
        isRowLoaded={this.isRowLoaded}
        loadMoreRows={this.loadMoreRows}
        rowCount={this.props.total}
        threshold={300}
        minimumBatchSize={300}
      >
        {({onRowsRendered, registerChild}) => (
          <AutoSizer>
            {({height, width}) => (
              <List
                deferredMeasurementCache={this.cellCache}
                height={height - 60}
                onRowsRendered={onRowsRendered}
                ref={registerChild}
                rowCount={this.props.total}
                rowHeight={this.cellCache.rowHeight}
                rowRenderer={this.rowRenderer}
                width={width}
              />
            )}
          </AutoSizer>
        )}
      </InfiniteLoader>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState}, ownProps: any) => {
  return {
    path: '',
    total: 0,
  }
}

export default connect(mapStateToProps)(DBVListView)
