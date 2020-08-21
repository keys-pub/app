import * as React from 'react'
import * as renderer from 'react-test-renderer'

import AuthLock from '../../src/renderer/views/auth/unlock'

describe('Auth unlock', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<AuthLock />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
