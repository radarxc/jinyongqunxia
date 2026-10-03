// Apple Vision 2D/3D body-pose helper. Output is one sorted JSON object.
import AppKit
import Foundation
import Vision

guard CommandLine.arguments.count == 2 ||
      (CommandLine.arguments.count == 3 && CommandLine.arguments[2] == "--2d-only") else {
  FileHandle.standardError.write(Data("usage: vision_pose IMAGE [--2d-only]\n".utf8))
  exit(2)
}
let path = CommandLine.arguments[1]
let allow3D = CommandLine.arguments.count == 2
func emit(_ output: [String: Any]) {
  let data = try! JSONSerialization.data(withJSONObject: output, options: [.sortedKeys])
  print(String(data: data, encoding: .utf8)!)
}
guard let image = NSImage(contentsOfFile: path),
      let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
  emit(["error": "load"]);
  exit(1)
}
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
var output: [String: Any] = ["w": cg.width, "h": cg.height]
let request2D = VNDetectHumanBodyPoseRequest()
do {
  try handler.perform([request2D])
  if let observation = request2D.results?.first {
    let points = try observation.recognizedPoints(.all)
    var encoded: [String: [Double]] = [:]
    for (name, point) in points where point.confidence > 0 {
      encoded[name.rawValue.rawValue] = [
        Double(point.location.x) * Double(cg.width),
        Double(1 - point.location.y) * Double(cg.height),
        Double(point.confidence),
      ]
    }
    output["pose2d"] = encoded
  }
} catch { output["err2d"] = "\(error)"; emit(output); exit(3) }

if allow3D, #available(macOS 14.0, *) {
  let request3D = VNDetectHumanBodyPose3DRequest()
  do {
    try handler.perform([request3D])
    if let observation = request3D.results?.first {
      var encoded: [String: [Double]] = [:]
      for name in observation.availableJointNames {
        let point = try observation.recognizedPoint(name).position
        encoded[name.rawValue.rawValue] = [Double(point.columns.3.x),
                                           Double(point.columns.3.y),
                                           Double(point.columns.3.z)]
      }
      output["pose3d"] = encoded
      output["bodyHeight"] = Double(observation.bodyHeight)
    }
  } catch { output["err3d"] = "\(error)" }
}
emit(output)
