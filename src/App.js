import logo from './logo.svg';
import "@aws-amplify/ui-react/styles.css"
import {
  withAuthenticator,
  Button,
  Heading,
  Image,
  View,
  Card
} from "@aws-amplify/ui-react"

function App({ signOut }) {
  return (
    <View className="App">
      <Card>
        <Image src={logo} className="App-logo" alt="logo" alignSelf={'center'} />
        <Heading level={1} alignSelf={'center'}>We now have Auth!</Heading>
      </Card>
      <Button onClick={signOut} alignSelf={'center'}>Sign Out</Button>
    </View>
  );
}

export default withAuthenticator(App);
