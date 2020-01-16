var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as React from 'react';
import { connect } from 'react-redux';
import { Divider, LinearProgress, Box } from '@material-ui/core';
import { search } from '../../rpc/rpc';
var ComposeView = /** @class */ (function (_super) {
    __extends(ComposeView, _super);
    function ComposeView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            loading: false,
            results: [],
        };
        _this.search = function (q) {
            return new Promise(function (resolve, reject) {
                _this.props.dispatch(search({ query: q, limit: 100 }, function (resp) {
                    resolve(resp.results || []);
                }, function (err) {
                    reject(err);
                }));
            });
        };
        _this.select = function (results) {
            _this.setState({ results: results });
        };
        _this.send = function (text) { };
        return _this;
    }
    // send = (text: string) => {
    //   const kids = this.state.users.map((u: User): string => {
    //     return u.kid
    //   })
    //   kids.push(this.props.sender.kid)
    //   const address = kids.sort().join(':')
    //   console.log('Users', this.state.users)
    //   console.log('Sender', this.props.sender.kid)
    //   console.log('Send', text)
    //   console.log('Address', address)
    //   const req: MessageCreateRequest = {kid: '', sender: this.props.sender.kid, id: '', text}
    //   this.setState({loading: true})
    //   this.props.dispatch(
    //     messageCreate(
    //       req,
    //       (resp: MessageCreateResponse) => {
    //         this.setState({loading: false})
    //         //this.props.dispatch(goBack())
    //       },
    //       (err: RPCError) => {
    //         this.setState({loading: false})
    //         // TODO
    //       }
    //     )
    //   )
    // }
    ComposeView.prototype.render = function () {
        return (React.createElement(Box, { display: "flex", flex: 1, flexDirection: "column" },
            !this.state.loading && React.createElement(Divider, { style: { marginBottom: 3 } }),
            this.state.loading && React.createElement(LinearProgress, null),
            React.createElement(Divider, null)));
    };
    return ComposeView;
}(React.Component));
var mapStateToProps = function (state) {
    return {};
};
export default connect(mapStateToProps)(ComposeView);
//# sourceMappingURL=index.js.map