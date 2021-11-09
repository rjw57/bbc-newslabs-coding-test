import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { tearDownConnection } from './src/api/db';

configure({ adapter: new Adapter() });

// Jest won't exit if there are outstanding async operations. As such, once all
// tests have been run, make sure to tear down any DB connections.
afterAll(tearDownConnection);
