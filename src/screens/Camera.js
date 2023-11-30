import React, { useRef} from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Platform,
    PermissionsAndroid,
    Text,
} from 'react-native';
import { Camera as RNCamera, useCameraDevices, CameraPermissionStatus, useCameraFormat} from 'react-native-vision-camera';
// import { RNCamera } from 'react-native-camera';
// import { useCamera } from 'react-native-camera-hooks';
import CustomButton from '../utils/CustomButton';
import { useIsFocused } from '@react-navigation/native';
import useAppState from "react-native-useappstate";
import { useDispatch, useSelector } from 'react-redux';
import { setTasks } from '../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Camera_f({ navigation, route }) {

  const checkPermission = async () => {
    // 카메라 권한 확인
    console.log('zzzzzzzz=? checkPermission')
    const cameraPermission = await RNCamera.getCameraPermissionStatus();

    console.log('yyyyyyyyyyyyyyy=? checkPermission' + cameraPermission)
    switch (cameraPermission) {
      case 'authorized':
        // 카메라 권한이 있을때 실행할 로직
        Alert.alert("checkPermission => Camera permission success");
        break;
        
      case 'not-determined':
        // 아직 권한 요청을 하지 않은 상태로 새롭게 권한 요청하기
        Alert.alert("checkPermission => camera permission not-determined");
        const newCameraPermission = await RNCamera.requestCameraPermission();

        if (newCameraPermission === 'authorized') {
          // 카메라 권한이 있을때 실행할 로직
        } else if (newCameraPermission === 'denied') {
          // 권한 요청을 했지만 거부됐을때 실행할 로직
          // ex) 설정으로 이동, 권한이 없으면 카메라 실행할 수 없다는 알림창 등등
          await Linking.openSettings();
        }
        break;
        
      case 'denied':
        // 권한 요청을 했지만 거부됐을때 실행할 로직
        // ex) 설정으로 이동, 권한이 없으면 카메라 실행할 수 없다는 알림창 등등
        Alert.alert("checkPermission => Please camera permission");
        await Linking.openSettings();
        break;
      default:
        console.log('ssssssssssss=? checkPermission')
    }
  };
  if (Platform.OS === 'android') {
    checkPermission();
  }

    // if (Platform.OS === 'android') {
    //     const requestCameraPermission = async () => {
    //       // const cameraPermission = await RNCamera.getCameraPermissionStatus()
    //       try {
    //               const granted = await PermissionsAndroid.request(
    //                 PermissionsAndroid.PERMISSIONS.CAMERA,
    //                 {
    //                   title: 'Camera Permission',
    //                   message: 'App needs permission for camera access',
    //                   buttonPositive: 'OK',
    //                 },
    //               );
    //               if(granted === PermissionsAndroid.RESULTS.GRANTED){
    //             Alert.alert("Camera permission success");
    //           }else {
    //             Alert.alert("Please camera permission");
    //            }
    //             } catch (err) {
    //               Alert.alert('Camera permission err');
    //               console.warn(err);
    //             }
    //         };
    //         requestCameraPermission();
    // }

    // const { hasPermission, requestPermission } = useCameraPermission()

    const device = useCameraDevices('back')
    // if (device == null) return <NoCameraDeviceError />
    const devices = useCameraDevices()
    // const device = devices.back
  
    if (device == null) return <Text>No Camera Device Error</Text>
    // return (
    //   <RNCamera
    //     style={StyleSheet.absoluteFill}
    //     device={device}
    //     photo={true}
    //     video={false}
    //     audio={false} // 선택사항
    //     isActive={true}
    //   />
    // )

    const isFocused = useIsFocused()
    const appState = useAppState()
    const isActive = isFocused && appState === "active"
    // const format = useCameraFormat(device, [
    //   { photoResolution: { width: 1920, height: 1080 } }
    // ])
    // const fps = format.maxFps >= 240 ? 240 : format.maxFps
    console.log('zzzzzzzz')
    const camera = useRef(null)
    // const camera = useRef<RNCamera>(null)
    console.log(camera)
    console.log('xxxxxxxxxxx')
    

    const captureHandle = async () => {
        try {
            console.log('tt1');
            const file = await camera.current.takePhoto({
                qualityPrioritization: 'speed',
                flash: 'off',
                enableShutterSound: false
            })

            console.log('tt2');
            const result = await CameraRoll.save(`file://${file.path}`, {
                type: 'photo',
            })
            console.log('tt3');
            const data = await result.blob();
            const filePath = file.path;
            console.log('tt4');
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
        <View style={styles.body}>
          {/* <Text>test111</Text> */}
          <RNCamera
            style={styles.preview}
            device={device}
            // format={format}
            // fps={fps}
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
        </View>
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