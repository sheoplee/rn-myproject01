import React from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import { RNCamera, useCameraDevices, useCameraFormat } from 'react-native-vision-camera';
import { useCameraPermission } from 'react-native-permissions';
// import { RNCamera } from 'react-native-camera';
// import { useCamera } from 'react-native-camera-hooks';
import CustomButton from '../utils/CustomButton';
import { useIsFocused } from '@react-navigation/native';
import useAppState from "react-native-useappstate";
import { useDispatch, useSelector } from 'react-redux';
import { setTasks } from '../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Camera({ navigation, route }) {

    if (Platform.OS === 'android') {
        const requestCameraPermission = async () => {
                try {
                  const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                      title: 'Camera Permission',
                      message: 'App needs permission for camera access',
                      buttonPositive: 'OK',
                    },
                  );
                  if(granted === PermissionsAndroid.RESULTS.GRANTED){
                Alert.alert("success");
              }else {
                Alert.alert("Please camera permission");
               }
                } catch (err) {
                  Alert.alert('Camera permission err');
                  console.warn(err);
                }
            };
            requestCameraPermission();
    }

    // const { hasPermission, requestPermission } = useCameraPermission()

    const device = useCameraDevices('back')
    if (device == null) return <NoCameraDeviceError />

    const isFocused = useIsFocused()
    const appState = useAppState()
    const isActive = isFocused && appState === "active"
    const format = useCameraFormat(device, [
        { videoResolution: 'max' },
        { photoResolution: 'max' }
      ])
    const fps = format.maxFps >= 240 ? 240 : format.maxFps
    const camera = useRef<Camera>(null)

    const captureHandle = async () => {
        try {
            const file = await camera.current.takePhoto({
                qualityPrioritization: 'speed',
                flash: 'off',
                enableShutterSound: false
            })

            const result = await CameraRoll.save(`file://${file.path}`, {
                type: 'photo',
            })
            const data = await result.blob();
            const filePath = file.path;
            updateTask(route.params.id, filePath);
        } catch (error) {
            console.log(error);
        }
    }

    const updateTask = (id, path) => {
        const index = tasks.findIndex(task => task.ID === id);
        if (index > -1) {
            let newTasks = [...tasks];
            newTasks[index].Image = path;
            AsyncStorage.setItem('Tasks', JSON.stringify(newTasks))
                .then(() => {
                    dispatch(setTasks(newTasks));
                    Alert.alert('Success!', 'Task image is saved.');
                    navigation.goBack();
                })
                .catch(err => console.log(err))
        }
    }
    
    return (
      <RNCamera
        style={styles.preview}
        device={device}
        format={format}
        fps={fps}
        isActive={isActive}
        // isActive="true"
        ref={camera}
        // {...cameraProps}
        // {...props}
        photo={true}
      >
        <CustomButton
            title="Capture"
            color='#1eb900'
            onPressFunction={() => captureHandle()}
        />
      </RNCamera>
    )

    // const [{ cameraRef }, { takePicture }] = useCamera(null);
    // const { tasks } = useSelector(state => state.taskReducer);
    // const dispatch = useDispatch();

    // const captureHandle = async () => {
    //     try {
    //         const data = await takePicture();
    //         const filePath = data.uri;
    //         updateTask(route.params.id, filePath);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // return (
    //     <View style={styles.body}>
    //         <RNCamera
    //             ref={cameraRef}
    //             type={RNCamera.Constants.Type.back}
    //             style={styles.preview}
    //         >
    //             <CustomButton
    //                 title="Capture"
    //                 color='#1eb900'
    //                 onPressFunction={() => captureHandle()}
    //             />
    //         </RNCamera>
    //     </View>
    // );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
    },
    preview: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    }
});