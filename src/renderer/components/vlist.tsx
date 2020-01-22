import * as React from 'react'

import {Box, Button, Divider, Typography} from '@material-ui/core'
import {styles} from '.'

import {AutoSizer, CellMeasurer, CellMeasurerCache, InfiniteLoader, List} from 'react-virtualized'

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

export type Request = {
  index: number
  limit: number
}

export type Response = {
  rows: Array<any>
}

type ResponseFn = (resp: Response) => void
type ErrFn = (err: Error) => void

type Props = {
  total: number
  request: (req: Request, resp: ResponseFn | void, errFn: ErrFn | void) => void
  rowRender?: (index: number, row: any) => any
}

class VList extends React.Component<Props> {
  list: Array<any> = []
  cellCache: CellMeasurerCache

  constructor(props: Props) {
    super(props)
    this.cellCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 20,
    })
  }

  rowRenderComponents = (index: number, row: any) => {
    if (this.props.rowRender && index >= 0) {
      return this.props.rowRender(index, row)
    }
    return row
  }

  rowRender = (index: number, row: any, styles: any) => {
    return (
      <Box display="flex" flex={1} flexDirection="row" style={{backgroundColor: 'white', ...(styles || {})}}>
        <Box display="flex" flex={1} flexDirection="column">
          <Box display="flex" flexDirection="row">
            {this.rowRenderComponents(index, row)}
          </Box>
          <Divider />
        </Box>
      </Box>
    )
  }

  rowRenderer = (cell: Cell) => {
    const {index, isScrolling, key, parent, style} = cell
    const row = this.list[index]
    if (!row) return null
    return (
      <CellMeasurer cache={this.cellCache} columnIndex={0} rowIndex={index} parent={parent}>
        {this.rowRender(index, row, style)}
      </CellMeasurer>
    )
  }

  isRowLoaded = (r: RowLoaded): boolean => {
    return !!this.list[r.index]
  }

  loadMoreRows = (r: Range): Promise<any> => {
    const fn = (resolve, reject) => {
      const req: Request = {index: r.startIndex, limit: r.stopIndex - r.startIndex + 1}
      this.props.request(
        req,
        (resp: Response) => {
          // TODO: Check if component was unmounted, cancel in componentWillUnmount
          let i = r.startIndex
          for (const row of resp.rows) {
            this.list[i++] = row
          }
          resolve()
        },
        (err: Error) => {
          reject(err)
        }
      )
    }
    return new Promise(fn)
  }

  render() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
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
                  height={height}
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
      </Box>
    )
  }
}

export default VList
