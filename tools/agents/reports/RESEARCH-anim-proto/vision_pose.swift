// Apple Vision body pose probe: 2D (19 joints) + 3D (17 joints) on one image. Prints JSON.
import Foundation
import Vision
import AppKit

let path = CommandLine.arguments[1]
guard let img = NSImage(contentsOfFile: path), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("{\"error\":\"load\"}"); exit(1) }
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
let req2d = VNDetectHumanBodyPoseRequest()
var out: [String: Any] = ["w": cg.width, "h": cg.height]
do {
  try handler.perform([req2d])
  if let obs = req2d.results?.first {
    let pts = try obs.recognizedPoints(.all)
    var d: [String: [Double]] = [:]
    for (k, p) in pts where p.confidence > 0 { d[k.rawValue.rawValue] = [Double(p.location.x) * Double(cg.width), Double(1 - p.location.y) * Double(cg.height), Double(p.confidence)] }
    out["pose2d"] = d
  }
} catch { out["err2d"] = "\(error)" }
if #available(macOS 14.0, *) {
  let req3d = VNDetectHumanBodyPose3DRequest()
  do {
    try handler.perform([req3d])
    if let obs = req3d.results?.first {
      var d: [String: [Double]] = [:]
      for name in obs.availableJointNames {
        let p = try obs.recognizedPoint(name)
        let m = p.position
        d[name.rawValue.rawValue] = [Double(m.columns.3.x), Double(m.columns.3.y), Double(m.columns.3.z)]
      }
      out["pose3d"] = d
      out["bodyHeight"] = Double(obs.bodyHeight)
    }
  } catch { out["err3d"] = "\(error)" }
}
let data = try! JSONSerialization.data(withJSONObject: out, options: [.sortedKeys])
print(String(data: data, encoding: .utf8)!)
