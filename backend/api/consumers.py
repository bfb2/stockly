from channels.generic.websocket import AsyncWebsocketConsumer
import json
import websockets
import asyncio

class AlpacaConsumer(AsyncWebsocketConsumer):
    alpaca_ws = None
    async def connect(self):
        await self.accept()
        self.task = asyncio.create_task(self.connect_to_alpaca())
    async def disconnect(self, code):
        if self.alpaca_ws:
            await self.alpaca_ws.close()
            self.task.cancel()

    async def receive(self, text_data):

        try:
            data = json.loads(text_data)
            action =data.get('action')
            ticker = data.get('ticker')
            await self.alpaca_ws.send(json.dumps({"action":action, "bars":ticker, "quotes":ticker})) 
        except Exception as e:
            print(e)

    async def connect_to_alpaca(self):
        try:
            self.alpaca_ws = await websockets.connect("wss://stream.data.sandbox.alpaca.markets/v2/iex", additional_headers={"Authorization":"Basic Q0s0RzZZNENWME9SMFRaMDVRRlk6UElCMGlEY2JKRm9xNDB5czJuZXZZVGdhUk9LcjJ2RWFoaERDWlBPNw=="})
               
            await self.send({"connected":"TRUE"})
            
            while True:
                try:
                    message = await self.alpaca_ws.recv()
                    #print(f"Received from external WS: {message}")
                    # Forward the message to your local client
                    await self.send(text_data=message)
                except websockets.exceptions.ConnectionClosedOK:
                    print("External WebSocket closed normally.")
                    break
                except websockets.exceptions.ConnectionClosedError as e:
                    print(f"External WebSocket closed with error: {e}")
                    break
                except asyncio.CancelledError:
                    print("External WebSocket connection task cancelled.")
                    break # Task was cancelled, so break the loop
                except Exception as e:
                    print(f"Error receiving from external WS: {e}")
                    break # Other errors, break the loop
        except websockets.exceptions.InvalidURI as e:
            print(f"Invalid WebSocket URI: {e}")
        except websockets.exceptions.InvalidHandshake as e:
            print(f"External WebSocket handshake failed: {e}")
            # This is where you'd see issues with authorization headers if rejected
            # The error message might contain details about the rejection.
        except Exception as e:
            print('error', e)
        finally:
            self.alpaca_ws = None
