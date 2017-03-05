import React from 'react';
import i18n from 'meteor/universe:i18n';
import ReceiveIR from '../components/ReceiveIR';
import IrTest from '../components/IrTest';
import { Grid, Col, Row } from 'react-bootstrap';
import Validation from 'react-validation';
import Alert from 'react-s-alert';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

export default class ButtonRegister extends TrackerReact(React.Component) {
  constructor() {
    super(...arguments);
    this.state = {
      receiveState: 'receive',
      processing: false,
      hasPhotonCredentials: undefined,
    };
  }

  componentWillMount() {
    Meteor.call('hasPhotonCredentials', (error) => {
      if (error) {
        this.setState({ hasPhotonCredentials: false });
      } else {
        this.setState({ hasPhotonCredentials: true });
      }
    });
  }

  startReceiving() {
    this.setState({ receiveState: 'receiving' });
  }

  finishReceiving() {
    this.setState({ receiveState: 'received' });
  }

  formReset() {
    document.getElementById('input-button-title').value = '';
  }

  handleSubmit(event) {
    this.setState({ processing: true });
    event.preventDefault();
    const buttonTitle = event.target.buttonTitle.value;
    Meteor.call('insertIrData', buttonTitle, (error) => {
      this.setState({ processing: false });
      if (error) {
        if (error.error === 'Not unique id.') {
          Alert.error(i18n.getTranslation('buttonRegister', 'alerts.notUnique'), {
            position: 'bottom',
            effect: 'genie',
            timeout: 3000,
          });
        } else if (error.error === 'Could not connect to photon cloud.') {
          Alert.error(i18n.getTranslation('buttonRegister', 'alerts.connectionError'), {
            position: 'bottom',
            effect: 'genie',
            timeout: 3000,
          });
        }
      } else {
        this.setState({ receiveState: 'receive' });
        this.formReset();
        Alert.success(i18n.getTranslation('buttonRegister', 'alerts.success'), {
          position: 'bottom',
          effect: 'genie',
          timeout: 3000,
        });
      }
    });
  }

  render() {
    if (this.state.hasPhotonCredentials) {
      return (
        <div>
          <Grid className='center button-register-center'>
            <Validation.components.Form onSubmit={ this.handleSubmit.bind(this) } >
              <Row>
                <Col>
                  <Validation.components.Input
                    id='input-button-title'
                    className='input-style'
                    type='text'
                    name='buttonTitle'
                    value=''
                    placeholder={ i18n.getTranslation('buttonRegister', 'buttonTitle') }
                    validations={ ['required', 'buttonTitle'] }/>
                </Col>
              </Row>
              <Row>
                <Col>
                  <ReceiveIR
                    buttonState={ this.state.receiveState }
                    startReceiving={ () => this.startReceiving() }
                    finishReceiving={ () => this.finishReceiving() }
                  />
                </Col>
              </Row>
              {
                (this.state.receiveState === 'received') ?
                  <div>
                    <Row><Col><IrTest /></Col></Row>
                    <Row>
                      <Col>
                        {
                          this.state.processing ?
                            <Validation.components.Button className='button-style button-register-margin' disabled>
                              { i18n.getTranslation('buttonRegister', 'register') }
                            </Validation.components.Button> :
                            <Validation.components.Button className='button-style button-register-margin'>
                              { i18n.getTranslation('buttonRegister', 'register') }
                            </Validation.components.Button>
                        }
                      </Col>
                    </Row>
                  </div> :
                  null
              }
            </Validation.components.Form>
          </Grid>
        </div>
      );
    } else if (this.state.hasPhotonCredentials === false) {
      return (
        <div>
          <Grid className='center warning'>
            <Row>
              <Col xsOffset={ 1 } xs={ 10 } mdOffset={ 1 } md={ 10 }>
                <span>{ i18n.getTranslation('buttonRegister', 'error') }</span>
              </Col>
            </Row>
          </Grid>
        </div>
      );
    } else {
      return null;
    }
  }
}
